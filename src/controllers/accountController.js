import { query } from '../db.js';

// Crear cuenta/billetera
export async function createAccount(req, res) {
  const userId = req.user.id;
  const { name, type = 'cash', currency = 'EUR', initial_balance = 0, color = null, icon = null } = req.body;

  try {
    const q = `INSERT INTO accounts (user_id, name, type, currency, balance, color, icon)
               VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;
    const { rows } = await query(q, [userId, name, type, currency, initial_balance, color, icon]);

    res.status(201).json({ account: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

// Obtener todas las cuentas del usuario
export async function getAccounts(req, res) {
  const userId = req.user.id;

  try {
    const q = 'SELECT * FROM accounts WHERE user_id = $1 ORDER BY created_at DESC';
    const { rows } = await query(q, [userId]);

    res.json({ accounts: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

// Obtener cuenta por ID
export async function getAccountById(req, res) {
  const userId = req.user.id;
  const id = req.params.id;

  try {
    const q = 'SELECT * FROM accounts WHERE id = $1 AND user_id = $2';
    const { rows } = await query(q, [id, userId]);

    if (!rows.length) return res.status(404).json({ error: 'Account not found' });

    res.json({ account: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

// Actualizar cuenta
export async function updateAccount(req, res) {
  const userId = req.user.id;
  const id = req.params.id;
  const fields = req.body;

  try {
    const setParts = [];
    const vals = [];
    let idx = 1;

    for (const key of ['name', 'type', 'currency', 'balance', 'color', 'icon']) {
      if (fields[key] !== undefined) {
        setParts.push(`${key}=$${idx++}`);
        vals.push(fields[key]);
      }
    }

    if (!setParts.length) return res.status(400).json({ error: 'No fields to update' });

    vals.push(id);
    vals.push(userId);

    const q = `UPDATE accounts SET ${setParts.join(', ')} WHERE id=$${idx++} AND user_id=$${idx} RETURNING *`;
    const { rows } = await query(q, vals);

    if (!rows.length) return res.status(404).json({ error: 'Account not found or unauthorized' });

    res.json({ account: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

// Eliminar cuenta
export async function deleteAccount(req, res) {
  const userId = req.user.id;
  const id = req.params.id;

  try {
    const q = 'DELETE FROM accounts WHERE id=$1 AND user_id=$2 RETURNING *';
    const { rows } = await query(q, [id, userId]);

    if (!rows.length) return res.status(404).json({ error: 'Account not found' });

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

// Transferencia entre cuentas
export async function transferBetweenAccounts(req, res) {
  const userId = req.user.id;
  const { from_account_id, to_account_id, amount, description } = req.body;

  try {
    // Iniciar transacción de BD
    await query('BEGIN');

    // Verificar que ambas cuentas existan y pertenezcan al usuario
    const checkQ = 'SELECT id, balance FROM accounts WHERE id IN ($1, $2) AND user_id = $3';
    const { rows: accounts } = await query(checkQ, [from_account_id, to_account_id, userId]);

    if (accounts.length !== 2) {
      await query('ROLLBACK');
      return res.status(404).json({ error: 'One or both accounts not found' });
    }

    const fromAccount = accounts.find(a => a.id === from_account_id);

    // Verificar saldo suficiente
    if (parseFloat(fromAccount.balance) < parseFloat(amount)) {
      await query('ROLLBACK');
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Restar del origen
    await query('UPDATE accounts SET balance = balance - $1 WHERE id = $2', [amount, from_account_id]);

    // Sumar al destino
    await query('UPDATE accounts SET balance = balance + $1 WHERE id = $2', [amount, to_account_id]);

    // Crear registro de transferencia
    const transferQ = `INSERT INTO transfers (user_id, from_account_id, to_account_id, amount, description)
                       VALUES ($1, $2, $3, $4, $5) RETURNING *`;
    const { rows } = await query(transferQ, [userId, from_account_id, to_account_id, amount, description || null]);

    await query('COMMIT');

    // Emitir evento en tiempo real
    if (global.io) {
      global.io.to(`user_${userId}`).emit('transfer_created', rows[0]);
    }

    res.json({ transfer: rows[0] });
  } catch (err) {
    await query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

// Obtener historial de transferencias
export async function getTransfers(req, res) {
  const userId = req.user.id;

  try {
    const q = `
      SELECT t.*,
             fa.name as from_account_name,
             ta.name as to_account_name
      FROM transfers t
      LEFT JOIN accounts fa ON t.from_account_id = fa.id
      LEFT JOIN accounts ta ON t.to_account_id = ta.id
      WHERE t.user_id = $1
      ORDER BY t.created_at DESC
    `;
    const { rows } = await query(q, [userId]);

    res.json({ transfers: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}
