import { query } from '../db.js';
import { v4 as uuidv4 } from 'uuid';
import { body, validationResult } from 'express-validator';

export async function getUserById(req, res) {
  const userId = req.user.id;
  try {
    const q = 'SELECT id, email, name, role, avatar_url, created_at FROM users WHERE id=$1';
    const { rows } = await query(q, [userId]);
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json({ user: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function updateUser(req, res) {
  const userId = req.user.id;
  const { name, email } = req.body;
  try {
    const q = 'UPDATE users SET name=$1, email=$2 WHERE id=$3 RETURNING id, email, name, role, created_at';
    const { rows } = await query(q, [name, email, userId]);
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json({ user: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function deleteUser(req, res) {
  const userId = req.user.id;
  try {
    const q = 'DELETE FROM users WHERE id=$1 RETURNING *';
    const { rows } = await query(q, [userId]);
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function updateAvatar(req, res) {
  const userId = req.user.id;
  // req.file viene de multer
  const avatarUrl = `/uploads/avatars/${req.file.filename}`;

  try {
    const q = 'UPDATE users SET avatar_url=$1 WHERE id=$2 RETURNING id, email, name, role, avatar_url';
    const { rows } = await query(q, [avatarUrl, userId]);
    
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    
    res.json({ user: rows[0], message: 'Avatar updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error updating avatar' });
  }
}