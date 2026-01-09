import { query } from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import nodemailer from "nodemailer";
import crypto from "crypto";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { UAParser } from "ua-parser-js";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;
const REFRESH_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES_IN || "30d";

// Auxiliar para crear sesiones
async function createSession(userId, refreshToken, req) {
  try {
    const userAgentString = req.headers["user-agent"];
    const parser = new UAParser(userAgentString);
    const result = parser.getResult();
    const deviceInfo = {
      browser: result.browser.name,
      os: result.os.name,
      device: result.device.model || result.device.type || "Desktop/Mobile",
    };

    // IP Address extraction (simplified)
    const ip =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress || req.ip;

    const { rows } = await query(
      `INSERT INTO sessions (user_id, refresh_token, ip_address, user_agent, device_info)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [userId, refreshToken, ip, userAgentString, JSON.stringify(deviceInfo)]
    );
    return rows[0].id;
  } catch (err) {
    console.error("Error creating session:", err);
    return null;
  }
}

export async function register(req, res) {
  const {
    email,
    password,
    name,
    numberPhone,
    location,
    address,
    preferCoin,
    mensualIngres,
    birthDay,
  } = req.body;
  const phone = numberPhone;
  const country = location;

  try {
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);

    const q = `INSERT INTO users (email, password_hash, name, phone, country, address, currency, monthly_income, birth_date) 
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
               RETURNING id, email, name, role, created_at`;

    const { rows } = await query(q, [
      email,
      hash,
      name || null,
      phone || null,
      country || null,
      address || null,
      preferCoin || "USD",
      mensualIngres || null,
      birthDay || null,
    ]);

    const user = rows[0];

    // Generate Tokens
    const token = jwt.sign(
      { id: user.id, email: user.email, role: "user" },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    const refreshToken = jwt.sign({ id: user.id }, REFRESH_SECRET, {
      expiresIn: REFRESH_EXPIRES,
    });

    const expiresAt = new Date(Date.now() + msToMs(REFRESH_EXPIRES));

    // Store Refresh Token (Legacy table + New Sessions table)
    await query(
      "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1,$2,$3)",
      [user.id, refreshToken, expiresAt]
    );

    // Create Device Session
    await createSession(user.id, refreshToken, req);

    res.json({ user, token, refreshToken });
  } catch (err) {
    if (err.code === "23505")
      return res.status(400).json({ error: "Email already registered" });
    console.error("[REGISTER ERROR]", err);
    res.status(500).json({ error: "Server error" });
  }
}

export async function login(req, res) {
  const { email, password } = req.body;
  try {
    const q = "SELECT * FROM users WHERE email=$1";
    const { rows } = await query(q, [email]);

    if (!rows.length)
      return res.status(401).json({ error: "Credenciales inválidas" });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match)
      return res.status(401).json({ error: "Credenciales inválidas" });

    // Check 2FA
    if (user.two_factor_enabled) {
      // Return a temporary token and flag to request 2FA code
      // Token only valid for verify-2fa endpoint
      const tempToken = jwt.sign(
        { id: user.id, role: user.role, is2faHandshake: true },
        JWT_SECRET,
        { expiresIn: "5m" }
      );

      // Remove sensitive data
      const { password_hash, two_factor_secret, ...safeUser } = user;

      return res.json({
        require2FA: true,
        tempToken,
        message: "2FA code required",
      });
    }

    // Normal Login Flow (Prepare data, session created later)
    // We need session ID BEFORE signing token now?
    // CIRCULAR DEPENDENCY: Token needs SessionID, Session needs Token (refresh).
    // Access Token needs SessionID. Refresh Token creates Session.

    const refreshToken = jwt.sign({ id: user.id }, REFRESH_SECRET, {
      expiresIn: REFRESH_EXPIRES,
    });

    const expiresAt = new Date(Date.now() + msToMs(REFRESH_EXPIRES));

    await query(
      "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1,$2,$3)",
      [user.id, refreshToken, expiresAt]
    );

    // Create Real Device Session
    const sessionId = await createSession(user.id, refreshToken, req);

    if (!sessionId)
      return res.status(500).json({ error: "Failed to create session" });

    // Now sign Access Token WITH sessionId
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, sessionId },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const { password_hash, two_factor_secret, ...userWithoutPass } = user;
    res.json({ user: userWithoutPass, token, refreshToken, sessionId });
  } catch (err) {
    console.error("[LOGIN ERROR]", err);
    res.status(500).json({ error: "Server error" });
  }
}

// Finalize Login with 2FA Code
export async function verifyLogin2FA(req, res) {
  const { tempToken, code } = req.body;

  try {
    // Verify temp token
    let payload;
    try {
      payload = jwt.verify(tempToken, JWT_SECRET);
    } catch (e) {
      return res
        .status(401)
        .json({ error: "Session expired, please login again" });
    }

    if (!payload.is2faHandshake) {
      return res.status(401).json({ error: "Invalid login flow" });
    }

    const userId = payload.id;
    const { rows } = await query("SELECT * FROM users WHERE id = $1", [userId]);
    if (!rows.length) return res.status(404).json({ error: "User not found" });

    const user = rows[0];

    // Verify TOTP
    const verified = speakeasy.totp.verify({
      secret: user.two_factor_secret,
      encoding: "base32",
      token: code,
      window: 1, // Allow 30s drift
    });

    if (!verified) {
      return res.status(400).json({ error: "Código 2FA inválido" });
    }

    // Success - generate real tokens
    const refreshToken = jwt.sign({ id: user.id }, REFRESH_SECRET, {
      expiresIn: REFRESH_EXPIRES,
    });

    const expiresAt = new Date(Date.now() + msToMs(REFRESH_EXPIRES));

    await query(
      "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1,$2,$3)",
      [user.id, refreshToken, expiresAt]
    );

    const sessionId = await createSession(user.id, refreshToken, req);

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, sessionId },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const { password_hash, two_factor_secret, ...userWithoutPass } = user;
    res.json({ user: userWithoutPass, token, refreshToken, sessionId });
  } catch (err) {
    console.error("[2FA LOGIN ERROR]", err);
    res.status(500).json({ error: "Server error" });
  }
}

// ---------------- 2FA SETUP ----------------

export async function setup2FA(req, res) {
  const userId = req.user.id;

  try {
    const { rows } = await query("SELECT email FROM users WHERE id=$1", [
      userId,
    ]);
    if (!rows.length) return res.status(404).json({ error: "User not found" });
    const email = rows[0].email;

    const secret = speakeasy.generateSecret({
      name: `FinanceFlow (${email})`,
    });

    // Save secret temporarily (or permanently but not enabled yet)
    // We update secret but keep enabled = false until verification
    await query("UPDATE users SET two_factor_secret = $1 WHERE id = $2", [
      secret.base32,
      userId,
    ]);

    // Generate QR
    QRCode.toDataURL(secret.otpauth_url, (err, data_url) => {
      if (err) return res.status(500).json({ error: "Error generating QR" });

      res.json({
        secret: secret.base32,
        qrCode: data_url,
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

export async function confirm2FA(req, res) {
  const { code } = req.body;
  const userId = req.user.id;

  try {
    const { rows } = await query(
      "SELECT two_factor_secret FROM users WHERE id=$1",
      [userId]
    );
    if (!rows.length) return res.status(404).json({ error: "User not found" });

    const user = rows[0];

    const verified = speakeasy.totp.verify({
      secret: user.two_factor_secret,
      encoding: "base32",
      token: code,
      window: 1,
    });

    if (verified) {
      await query("UPDATE users SET two_factor_enabled = TRUE WHERE id = $1", [
        userId,
      ]);
      res.json({ success: true, message: "2FA activado correctamente" });
    } else {
      res.status(400).json({ success: false, error: "Código inválido" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

export async function disable2FA(req, res) {
  const userId = req.user.id;
  try {
    await query(
      "UPDATE users SET two_factor_enabled = FALSE, two_factor_secret = NULL WHERE id = $1",
      [userId]
    );
    res.json({ success: true, message: "2FA desactivado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

// ---------------- SESSIONS / DEVICES ----------------

export async function getSessions(req, res) {
  const userId = req.user.id;
  try {
    const { rows } = await query(
      "SELECT id, ip_address, device_info, last_active, created_at FROM sessions WHERE user_id = $1 ORDER BY last_active DESC",
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

export async function revokeSession(req, res) {
  const userId = req.user.id;
  const sessionId = req.params.id;

  try {
    // Get refresh token to delete from legacy table too
    const { rows } = await query(
      "SELECT refresh_token FROM sessions WHERE id=$1 AND user_id=$2",
      [sessionId, userId]
    );
    if (rows.length > 0) {
      const token = rows[0].refresh_token;
      await query("DELETE FROM refresh_tokens WHERE token=$1", [token]);
    }

    const result = await query(
      "DELETE FROM sessions WHERE id=$1 AND user_id=$2 RETURNING id",
      [sessionId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Session not found or not yours" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

// ---------------- EXISTING HELPERS ----------------

export async function getProfile(req, res) {
  /* same as before but keeping it concise */
  try {
    const q =
      "SELECT id, email, name, role, avatar_url, phone, country, address, currency, monthly_income, birth_date, created_at, two_factor_enabled FROM users WHERE id = $1";
    const { rows } = await query(q, [req.user.id]);
    if (!rows.length) return res.status(404).json({ error: "User not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
}

export async function changePassword(req, res) {
  /* same as original */
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;
  try {
    const { rows } = await query(
      "SELECT password_hash FROM users WHERE id=$1",
      [userId]
    );
    if (!rows.length) return res.status(404).json({ error: "User not found" });
    const match = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!match) return res.status(400).json({ error: "Contraseña incorrecta" });

    const hash = await bcrypt.hash(newPassword, 10);
    await query("UPDATE users SET password_hash=$1 WHERE id=$2", [
      hash,
      userId,
    ]);
    res.json({ message: "Contraseña actualizada" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
}

export async function refreshToken(req, res) {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: "No refresh token" });
  try {
    const payload = jwt.verify(refreshToken, REFRESH_SECRET);
    const { rows } = await query(
      "SELECT * FROM refresh_tokens WHERE token=$1",
      [refreshToken]
    );
    if (!rows.length)
      return res.status(401).json({ error: "Invalid refresh token" });

    // Update session activity
    await query(
      "UPDATE sessions SET last_active=NOW() WHERE refresh_token=$1",
      [refreshToken]
    );

    const userRes = await query("SELECT id,email,role FROM users WHERE id=$1", [
      payload.id,
    ]);
    const user = userRes.rows[0];

    if (!user) return res.status(401).json({ error: "User not found" });

    // Find session to embed in new token
    let sessionId = undefined;
    const sRes = await query("SELECT id FROM sessions WHERE refresh_token=$1", [
      refreshToken,
    ]);
    if (sRes.rows.length > 0) sessionId = sRes.rows[0].id;

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, sessionId },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    res.json({ token });
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
}

export async function logout(req, res) {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: "Missing token" });
  try {
    await query("DELETE FROM refresh_tokens WHERE token=$1", [refreshToken]);
    await query("DELETE FROM sessions WHERE refresh_token=$1", [refreshToken]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
}

export async function forgotPassword(req, res) {
  /* same as original, keeping existing logic */
  const { email } = req.body;
  try {
    const { rows } = await query(
      "SELECT id,email,name FROM users WHERE email=$1",
      [email]
    );
    if (!rows.length)
      return res.status(200).json({ message: "Si existe, email enviado" });
    const user = rows[0];
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 3600000);
    await query(
      "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1,$2,$3) ON CONFLICT (user_id) DO UPDATE SET token=$2, expires_at=$3",
      [user.id, token, expiry]
    );
    // ... mail sending logic (simplified here for brevity as it was long, but assuming existing implementation structure is preserved if unchanged)
    // NOTE: In a full replacement, I should include the mailer logic. I will include a placeholder or simplified version if not requested to change.
    // Since I must replace the WHOLE file, I will restore the original Nodemailer logic to avoid breaking it.

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
    const link = `${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }/reset-password/${token}`;
    await transporter.sendMail({
      from: `"FinanceFlow" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Recuperar Contraseña",
      html: `<a href="${link}">Recuperar Contraseña</a>`,
    });

    res.json({ message: "Si existe, email enviado" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error" });
  }
}

export async function resetPassword(req, res) {
  /* same as original */
  const { token, newPassword } = req.body;
  try {
    const { rows } = await query(
      "SELECT user_id, expires_at FROM password_reset_tokens WHERE token=$1",
      [token]
    );
    if (!rows.length) return res.status(400).json({ error: "Invalido" });
    if (new Date() > new Date(rows[0].expires_at))
      return res.status(400).json({ error: "Expirado" });

    const hash = await bcrypt.hash(newPassword, 10);
    await query("UPDATE users SET password_hash=$1 WHERE id=$2", [
      hash,
      rows[0].user_id,
    ]);
    await query("DELETE FROM password_reset_tokens WHERE token=$1", [token]);
    res.json({ message: "Exito" });
  } catch (e) {
    res.status(500).json({ error: "Error" });
  }
}

function msToMs(str) {
  if (!str) return 0;
  const match = /^(\d+)([dhm])$/.exec(str);
  if (!match) return 0;
  const value = Number(match[1]);
  const unit = match[2];
  if (unit === "d") return value * 24 * 60 * 60 * 1000;
  if (unit === "h") return value * 60 * 60 * 1000;
  if (unit === "m") return value * 60 * 1000;
  return 0;
}
