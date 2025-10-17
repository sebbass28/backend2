import { query } from '../db.js';

// Crear transacción recurrente
export async function createRecurring(req, res) {
  const userId = req.user.id;
  const {
    type,
    amount,
    currency = 'EUR',
    category_id,
    description,
    frequency, // daily, weekly, monthly, yearly
    start_date,
    end_date = null,
    account_id = null,
    is_active = true
  } = req.body;

  try {
    const q = `INSERT INTO recurring_transactions
               (user_id, type, amount, currency, category_id, description, frequency, start_date, end_date, account_id, is_active)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`;
    const { rows } = await query(q, [
      userId, type, amount, currency, category_id || null,
      description || null, frequency, start_date, end_date, account_id, is_active
    ]);

    res.status(201).json({ recurring: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

// Obtener todas las transacciones recurrentes
export async function getRecurrings(req, res) {
  const userId = req.user.id;
  const { is_active } = req.query;

  try {
    let q = `
      SELECT r.*, c.name as category_name, a.name as account_name
      FROM recurring_transactions r
      LEFT JOIN categories c ON r.category_id = c.id
      LEFT JOIN accounts a ON r.account_id = a.id
      WHERE r.user_id = $1
    `;

    const params = [userId];

    if (is_active !== undefined) {
      params.push(is_active === 'true');
      q += ` AND r.is_active = $${params.length}`;
    }

    q += ' ORDER BY r.created_at DESC';

    const { rows } = await query(q, params);

    res.json({ recurrings: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

// Obtener recurrente por ID
export async function getRecurringById(req, res) {
  const userId = req.user.id;
  const id = req.params.id;

  try {
    const q = `
      SELECT r.*, c.name as category_name, a.name as account_name
      FROM recurring_transactions r
      LEFT JOIN categories c ON r.category_id = c.id
      LEFT JOIN accounts a ON r.account_id = a.id
      WHERE r.id = $1 AND r.user_id = $2
    `;
    const { rows } = await query(q, [id, userId]);

    if (!rows.length) return res.status(404).json({ error: 'Recurring transaction not found' });

    res.json({ recurring: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

// Actualizar transacción recurrente
export async function updateRecurring(req, res) {
  const userId = req.user.id;
  const id = req.params.id;
  const fields = req.body;

  try {
    const setParts = [];
    const vals = [];
    let idx = 1;

    for (const key of ['type', 'amount', 'currency', 'category_id', 'description', 'frequency', 'start_date', 'end_date', 'account_id', 'is_active', 'last_executed']) {
      if (fields[key] !== undefined) {
        setParts.push(`${key}=$${idx++}`);
        vals.push(fields[key]);
      }
    }

    if (!setParts.length) return res.status(400).json({ error: 'No fields to update' });

    vals.push(id);
    vals.push(userId);

    const q = `UPDATE recurring_transactions SET ${setParts.join(', ')} WHERE id=$${idx++} AND user_id=$${idx} RETURNING *`;
    const { rows } = await query(q, vals);

    if (!rows.length) return res.status(404).json({ error: 'Recurring transaction not found' });

    res.json({ recurring: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

// Eliminar transacción recurrente
export async function deleteRecurring(req, res) {
  const userId = req.user.id;
  const id = req.params.id;

  try {
    const q = 'DELETE FROM recurring_transactions WHERE id=$1 AND user_id=$2 RETURNING *';
    const { rows } = await query(q, [id, userId]);

    if (!rows.length) return res.status(404).json({ error: 'Recurring transaction not found' });

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

// Ejecutar manualmente una transacción recurrente (crear transacción real)
export async function executeRecurring(req, res) {
  const userId = req.user.id;
  const id = req.params.id;

  try {
    // Obtener la transacción recurrente
    const recurringQ = 'SELECT * FROM recurring_transactions WHERE id=$1 AND user_id=$2 AND is_active=true';
    const { rows: recRows } = await query(recurringQ, [id, userId]);

    if (!recRows.length) {
      return res.status(404).json({ error: 'Recurring transaction not found or inactive' });
    }

    const recurring = recRows[0];

    // Crear transacción real
    const txQ = `INSERT INTO transactions (user_id, type, amount, currency, category_id, description, date, account_id)
                 VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7) RETURNING *`;
    const { rows: txRows } = await query(txQ, [
      userId,
      recurring.type,
      recurring.amount,
      recurring.currency,
      recurring.category_id,
      `${recurring.description} (Recurrente)`,
      recurring.account_id
    ]);

    // Actualizar last_executed
    await query('UPDATE recurring_transactions SET last_executed=NOW() WHERE id=$1', [id]);

    // Actualizar balance de cuenta si existe
    if (recurring.account_id) {
      const sign = recurring.type === 'income' ? '+' : '-';
      await query(`UPDATE accounts SET balance = balance ${sign} $1 WHERE id=$2`, [recurring.amount, recurring.account_id]);
    }

    // Emitir evento
    if (global.io) {
      global.io.to(`user_${userId}`).emit('transaction_created', txRows[0]);
    }

    res.json({ transaction: txRows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}
