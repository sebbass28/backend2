import { query } from '../db.js';

// Create investment
export async function createInvestment(req, res) {
  const userId = req.user.id;
  const { name, type, symbol, quantity, purchasePrice, currentPrice, purchaseDate } = req.body;

  try {
    const q = `INSERT INTO investments (user_id, name, type, symbol, quantity, purchase_price, current_price, purchase_date)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`;
    
    // Map camelCase to snake_case for DB
    const { rows } = await query(q, [
      userId, 
      name, 
      type, 
      symbol, 
      quantity, 
      purchasePrice, 
      currentPrice, 
      purchaseDate
    ]);

    res.status(201).json(mapToCamelCase(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

// Get all investments
export async function getInvestments(req, res) {
  const userId = req.user.id;

  try {
    const q = `SELECT * FROM investments WHERE user_id = $1 ORDER BY created_at DESC`;
    const { rows } = await query(q, [userId]);

    res.json(rows.map(mapToCamelCase));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

// Get investment by ID
export async function getInvestmentById(req, res) {
  const userId = req.user.id;
  const id = req.params.id;

  try {
    const q = `SELECT * FROM investments WHERE id = $1 AND user_id = $2`;
    const { rows } = await query(q, [id, userId]);

    if (!rows.length) return res.status(404).json({ error: 'Investment not found' });

    res.json(mapToCamelCase(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

// Update investment
export async function updateInvestment(req, res) {
  const userId = req.user.id;
  const id = req.params.id;
  const fields = req.body;

  try {
    const setParts = [];
    const vals = [];
    let idx = 1;

    // Map allowed fields
    const fieldMap = {
      name: 'name',
      type: 'type',
      symbol: 'symbol',
      quantity: 'quantity',
      purchasePrice: 'purchase_price',
      currentPrice: 'current_price',
      purchaseDate: 'purchase_date'
    };

    for (const [key, dbCol] of Object.entries(fieldMap)) {
      if (fields[key] !== undefined) {
        setParts.push(`${dbCol}=$${idx++}`);
        vals.push(fields[key]);
      }
    }

    if (!setParts.length) return res.status(400).json({ error: 'No fields to update' });

    vals.push(id);
    vals.push(userId);

    const q = `UPDATE investments SET ${setParts.join(', ')} WHERE id=$${idx++} AND user_id=$${idx} RETURNING *`;
    const { rows } = await query(q, vals);

    if (!rows.length) return res.status(404).json({ error: 'Investment not found' });

    res.json(mapToCamelCase(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

// Delete investment
export async function deleteInvestment(req, res) {
  const userId = req.user.id;
  const id = req.params.id;

  try {
    const q = 'DELETE FROM investments WHERE id=$1 AND user_id=$2 RETURNING *';
    const { rows } = await query(q, [id, userId]);

    if (!rows.length) return res.status(404).json({ error: 'Investment not found' });

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

// Helper to map DB snake_case to API camelCase
function mapToCamelCase(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    type: row.type,
    symbol: row.symbol,
    quantity: parseFloat(row.quantity),
    purchasePrice: parseFloat(row.purchase_price),
    currentPrice: parseFloat(row.current_price),
    purchaseDate: row.purchase_date,
    createdAt: row.created_at
  };
}
