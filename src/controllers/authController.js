import { query } from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;
const REFRESH_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d';

export async function register(req, res) {
  const { email, password, name } = req.body;
  try {
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    const q = `INSERT INTO users (email, password_hash, name) VALUES ($1,$2,$3) RETURNING id,email,name,created_at`;
    const { rows } = await query(q, [email, hash, name || null]);

    const user = rows[0];
    const token = jwt.sign({ id: user.id, email: user.email, role: 'user' }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = jwt.sign({ id: user.id }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });

    const expiresAt = new Date(Date.now() + msToMs(REFRESH_EXPIRES));
    await query('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1,$2,$3)', [user.id, refreshToken, expiresAt]);

    res.json({ user, token, refreshToken });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Email already registered' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function login(req, res) {
  const { email, password } = req.body;
  try {
    const q = 'SELECT id,email,password_hash,name,role FROM users WHERE email=$1';
    const { rows } = await query(q, [email]);
    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = jwt.sign({ id: user.id }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });

    const expiresAt = new Date(Date.now() + msToMs(REFRESH_EXPIRES));
    await query('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1,$2,$3)', [user.id, refreshToken, expiresAt]);

    res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role }, token, refreshToken });
  } catch (err) {
    console.error(err);
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