import { query } from '../db.js';

export async function createBudget(req, res) {
  const userId = req.user.id;
  const { category_id, limit_amount, period } = req.body;
  try {
    const q = `INSERT INTO budgets (user_id, category_id, limit_amount, period)
               VALUES ($1, $2, $3, $4) RETURNING *`;
    const { rows } = await query(q, [userId, category_id, limit_amount, period]);
    res.status(201).json({ budget: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function getBudgets(req, res) {
  const userId = req.user.id;
  try {
    const q = 'SELECT * FROM budgets WHERE user_id = $1';
    const { rows } = await query(q, [userId]);
    res.json({ budgets: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function getBudgetById(req, res) {
  const userId = req.user.id;
  const id = req.params.id;
  try {
    const q = 'SELECT * FROM budgets WHERE id = $1 AND user_id = $2';
    const { rows } = await query(q, [id, userId]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ budget: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function updateBudget(req, res) {
  const userId = req.user.id;
  const id = req.params.id;
  const fields = req.body;
  try {
    const setParts = [];
    const vals = [];
    let idx = 1;

    for (const key of ['category_id', 'limit_amount', 'period']) {
      if (fields[key] !== undefined) {
        setParts.push(`${key}=$${idx++}`);
        vals.push(fields[key]);
      }
    }

    if (!setParts.length) return res.status(400).json({ error: 'No fields to update' });
    vals.push(id);
    vals.push(userId);

    const q = `UPDATE budgets SET ${setParts.join(', ')} WHERE id=$${idx++} AND user_id=$${idx} RETURNING *`;
    const { rows } = await query(q, vals);
    if (!rows.length) return res.status(404).json({ error: 'Not found or unauthorized' });

    res.json({ budget: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function deleteBudget(req, res) {
  const userId = req.user.id;
  const id = req.params.id;
  try {
    const q = 'DELETE FROM budgets WHERE id=$1 AND user_id=$2 RETURNING *';
    const { rows } = await query(q, [id, userId]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}