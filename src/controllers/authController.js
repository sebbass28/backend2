import { query } from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';
import crypto from 'crypto';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;
const REFRESH_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d';

export async function register(req, res) {
  const { email, password, name } = req.body;
  try {
    console.log('[REGISTER] Starting registration for email:', email);
    console.log('[REGISTER] JWT_SECRET exists:', !!JWT_SECRET);
    console.log('[REGISTER] REFRESH_SECRET exists:', !!REFRESH_SECRET);

    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    const q = `INSERT INTO users (email, password_hash, name) VALUES ($1,$2,$3) RETURNING id,email,name,created_at`;
    const { rows } = await query(q, [email, hash, name || null]);

    const user = rows[0];
    console.log('[REGISTER] User created with ID:', user.id);

    const token = jwt.sign({ id: user.id, email: user.email, role: 'user' }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = jwt.sign({ id: user.id }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });

    const expiresAt = new Date(Date.now() + msToMs(REFRESH_EXPIRES));
    await query('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1,$2,$3)', [user.id, refreshToken, expiresAt]);

    console.log('[REGISTER] Registration successful for user:', user.id);
    res.json({ user, token, refreshToken });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Email already registered' });
    console.error('[REGISTER ERROR]', err);
    console.error('[REGISTER ERROR] Message:', err.message);
    console.error('[REGISTER ERROR] Stack:', err.stack);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function login(req, res) {
  const { email, password } = req.body;
  try {
    console.log('[LOGIN] Starting login for email:', email);
    console.log('[LOGIN] JWT_SECRET exists:', !!JWT_SECRET);
    console.log('[LOGIN] REFRESH_SECRET exists:', !!REFRESH_SECRET);

    const q = 'SELECT id,email,password_hash,name,role FROM users WHERE email=$1';
    const { rows } = await query(q, [email]);
    console.log('[LOGIN] User query completed, found:', rows.length, 'users');

    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    console.log('[LOGIN] Password match:', match);

    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = jwt.sign({ id: user.id }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });

    const expiresAt = new Date(Date.now() + msToMs(REFRESH_EXPIRES));
    await query('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1,$2,$3)', [user.id, refreshToken, expiresAt]);

    console.log('[LOGIN] Login successful for user:', user.id);
    res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role }, token, refreshToken });
  } catch (err) {
    console.error('[LOGIN ERROR]', err);
    console.error('[LOGIN ERROR] Message:', err.message);
    console.error('[LOGIN ERROR] Stack:', err.stack);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function refreshToken(req, res) {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'No refresh token' });
  try {
    const payload = jwt.verify(refreshToken, REFRESH_SECRET);
    const { rows } = await query('SELECT * FROM refresh_tokens WHERE token=$1', [refreshToken]);
    if (!rows.length) return res.status(401).json({ error: 'Invalid refresh token' });

    const { id: userId } = payload;
    const q = 'SELECT id,email,role,name FROM users WHERE id=$1';
    const userRes = await query(q, [userId]);
    const user = userRes.rows[0];
    if (!user) return res.status(401).json({ error: 'User not found' });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'Invalid token' });
  }
}

export async function logout(req, res) {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'Missing refresh token' });
  try {
    await query('DELETE FROM refresh_tokens WHERE token=$1', [refreshToken]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

function msToMs(str) {
  if (!str) return 0;
  const match = /^(\d+)([dhm])$/.exec(str);
  if (!match) return 0;
  const value = Number(match[1]);
  const unit = match[2];
  if (unit === 'd') return value * 24 * 60 * 60 * 1000;
  if (unit === 'h') return value * 60 * 60 * 1000;
  if (unit === 'm') return value * 60 * 1000;
  return 0;
}

export async function forgotPassword(req, res) {
  const { email } = req.body;

  try {
    // Buscar el usuario por email
    const { rows } = await query('SELECT id, email, name FROM users WHERE email = $1', [email]);

    // Por seguridad, siempre retornar el mismo mensaje (no revelar si el email existe)
    if (!rows.length) {
      return res.status(200).json({
        message: 'Si el email existe, recibirás un correo de recuperación'
      });
    }

    const user = rows[0];

    // Generar token de recuperación
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora

    // Guardar token en la base de datos
    await query(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3) ON CONFLICT (user_id) DO UPDATE SET token = $2, expires_at = $3, created_at = NOW()',
      [user.id, resetToken, resetTokenExpiry]
    );

    // Configurar MailerSend
    const mailerSend = new MailerSend({
      apiKey: process.env.MAILERSEND_API_KEY,
    });

    const sentFrom = new Sender(
      process.env.MAILERSEND_SENDER_EMAIL,
      process.env.MAILERSEND_SENDER_NAME || 'FinanceFlow'
    );

    const recipients = [new Recipient(email, user.name || 'Usuario')];

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject('Recuperar Contraseña - FinanceFlow')
      .setHtml(`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #10b981;">Recuperación de Contraseña</h2>
          <p>Hola ${user.name || 'Usuario'},</p>
          <p>Recibimos una solicitud para restablecer tu contraseña.</p>
          <p>Haz clic en el siguiente botón para restablecer tu contraseña:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="
              display: inline-block;
              background-color: #10b981;
              color: white;
              padding: 14px 28px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: bold;
            ">Restablecer Contraseña</a>
          </div>
          <p>O copia y pega este enlace en tu navegador:</p>
          <p style="color: #666; word-break: break-all;">${resetUrl}</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #999; font-size: 12px;">
            Este enlace expirará en 1 hora.<br>
            Si no solicitaste este cambio, ignora este correo y tu contraseña permanecerá sin cambios.
          </p>
        </div>
      `)
      .setText(`
        Recuperación de Contraseña

        Hola ${user.name || 'Usuario'},

        Recibimos una solicitud para restablecer tu contraseña.

        Visita este enlace para restablecer tu contraseña:
        ${resetUrl}

        Este enlace expirará en 1 hora.
        Si no solicitaste este cambio, ignora este correo.
      `);

    await mailerSend.email.send(emailParams);

    res.status(200).json({
      message: 'Si el email existe, recibirás un correo de recuperación'
    });

  } catch (error) {
    console.error('Error en forgot-password:', error);
    res.status(500).json({
      error: 'Error al procesar la solicitud'
    });
  }
}

export async function resetPassword(req, res) {
  const { token, newPassword } = req.body;

  try {
    // Buscar el token
    const { rows } = await query(
      'SELECT user_id, expires_at FROM password_reset_tokens WHERE token = $1',
      [token]
    );

    if (!rows.length) {
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }

    const resetData = rows[0];

    // Verificar si el token ha expirado
    if (new Date() > new Date(resetData.expires_at)) {
      await query('DELETE FROM password_reset_tokens WHERE token = $1', [token]);
      return res.status(400).json({ error: 'Token expirado' });
    }

    // Hash de la nueva contraseña
    const saltRounds = 10;
    const hash = await bcrypt.hash(newPassword, saltRounds);

    // Actualizar la contraseña del usuario
    await query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [hash, resetData.user_id]
    );

    // Eliminar el token usado
    await query('DELETE FROM password_reset_tokens WHERE token = $1', [token]);

    // Opcional: Invalidar todos los refresh tokens del usuario
    await query('DELETE FROM refresh_tokens WHERE user_id = $1', [resetData.user_id]);

    res.status(200).json({
      message: 'Contraseña actualizada exitosamente'
    });

  } catch (error) {
    console.error('Error en reset-password:', error);
    res.status(500).json({
      error: 'Error al restablecer la contraseña'
    });
  }
}

export async function getProfile(req, res) {
  try {
    const q = 'SELECT id, email, name, role, created_at FROM users WHERE id = $1';
    const { rows } = await query(q, [req.user.id]);
    
    if (!rows.length) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}