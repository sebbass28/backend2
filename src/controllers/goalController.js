import { query } from '../db.js';

// Helper to map DB snake_case to API camelCase
function mapToCamelCase(row) {
  if (!row) return null;
  return {
    ...row,
    targetAmount: parseFloat(row.target_amount),
    currentAmount: parseFloat(row.current_amount),
    userId: row.user_id,
    createdAt: row.created_at,
    // Keep original for back-compat if needed, or cleanup
  };
}

// Crear meta de ahorro
export async function createGoal(req, res) {
  const userId = req.user.id;
  // Support both camelCase and snake_case
  const { name, targetAmount, target_amount, currentAmount, current_amount = 0, deadline, description, icon, color } = req.body;
  
  const target = targetAmount || target_amount;
  const current = currentAmount || current_amount || 0;

  try {
    const q = `INSERT INTO savings_goals (user_id, name, target_amount, current_amount, deadline, description, icon, color)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`;
    const { rows } = await query(q, [userId, name, target, current, deadline || null, description || null, icon || null, color || null]);

    res.status(201).json({ goal: mapToCamelCase(rows[0]) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

// Obtener todas las metas
export async function getGoals(req, res) {
  const userId = req.user.id;
  const { status } = req.query; // active, completed, all

  try {
    let q = `
      SELECT *,
             CASE
               WHEN current_amount >= target_amount THEN 'completed'
               WHEN deadline < NOW() THEN 'expired'
               ELSE 'active'
             END as status,
             ROUND((current_amount / NULLIF(target_amount, 0)) * 100, 2) as progress_percentage
      FROM savings_goals
      WHERE user_id = $1
    `;

    if (status === 'active') {
      q += ` AND current_amount < target_amount AND (deadline IS NULL OR deadline >= NOW())`;
    } else if (status === 'completed') {
      q += ` AND current_amount >= target_amount`;
    }

    q += ' ORDER BY created_at DESC';

    const { rows } = await query(q, [userId]);

    res.json(rows.map(mapToCamelCase));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

// Obtener meta por ID
export async function getGoalById(req, res) {
  const userId = req.user.id;
  const id = req.params.id;

  try {
    const q = `
      SELECT *,
             ROUND((current_amount / NULLIF(target_amount, 0)) * 100, 2) as progress_percentage
      FROM savings_goals
      WHERE id = $1 AND user_id = $2
    `;
    const { rows } = await query(q, [id, userId]);

    if (!rows.length) return res.status(404).json({ error: 'Goal not found' });

    res.json({ goal: mapToCamelCase(rows[0]) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

// Actualizar meta
export async function updateGoal(req, res) {
  const userId = req.user.id;
  const id = req.params.id;
  const fields = req.body;

  try {
    const setParts = [];
    const vals = [];
    let idx = 1;

    // Map camelCase keys to snake_case columns
    const keyMap = {
      name: 'name',
      targetAmount: 'target_amount',
      target_amount: 'target_amount',
      currentAmount: 'current_amount',
      current_amount: 'current_amount',
      deadline: 'deadline',
      description: 'description',
      icon: 'icon',
      color: 'color'
    };

    for (const key of Object.keys(fields)) {
      if (keyMap[key] && fields[key] !== undefined) {
        setParts.push(`${keyMap[key]}=$${idx++}`);
        vals.push(fields[key]);
      }
    }

    if (!setParts.length) return res.status(400).json({ error: 'No fields to update' });

    vals.push(id);
    vals.push(userId);

    const q = `UPDATE savings_goals SET ${setParts.join(', ')} WHERE id=$${idx++} AND user_id=$${idx} RETURNING *`;
    const { rows } = await query(q, vals);

    if (!rows.length) return res.status(404).json({ error: 'Goal not found or unauthorized' });

    // Emitir evento si se completó la meta
    if (parseFloat(rows[0].current_amount) >= parseFloat(rows[0].target_amount) && global.io) {
      global.io.to(`user_${userId}`).emit('goal_completed', rows[0]);
    }

    res.json({ goal: mapToCamelCase(rows[0]) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

// Contribuir a una meta
export async function contributeToGoal(req, res) {
  const userId = req.user.id;
  const id = req.params.id;
  const { amount } = req.body;

  try {
    const q = `UPDATE savings_goals
               SET current_amount = current_amount + $1
               WHERE id = $2 AND user_id = $3
               RETURNING *`;
    const { rows } = await query(q, [amount, id, userId]);

    if (!rows.length) return res.status(404).json({ error: 'Goal not found' });

    // Verificar si se completó la meta
    if (parseFloat(rows[0].current_amount) >= parseFloat(rows[0].target_amount) && global.io) {
      global.io.to(`user_${userId}`).emit('goal_completed', rows[0]);
    }

    res.json({ goal: mapToCamelCase(rows[0]) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

// Eliminar meta
export async function deleteGoal(req, res) {
  const userId = req.user.id;
  const id = req.params.id;

  try {
    const q = 'DELETE FROM savings_goals WHERE id=$1 AND user_id=$2 RETURNING *';
    const { rows } = await query(q, [id, userId]);

    if (!rows.length) return res.status(404).json({ error: 'Goal not found' });

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}
