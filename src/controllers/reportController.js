import { query } from '../db.js';

export async function getMonthlyBalance(req, res) {
  const userId = req.user.id;
  try {
    const q = `
      SELECT date_trunc('month', date) as month,
        SUM(CASE WHEN type='income' THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as total_expense
      FROM transactions
      WHERE user_id = $1
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12;
    `;
    const { rows } = await query(q, [userId]);
    res.json({ monthlyBalance: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function getExpensesByCategory(req, res) {
  const userId = req.user.id;
  try {
    const q = `
      SELECT c.name as category_name,
        SUM(t.amount) as total_expense
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = $1 AND t.type = 'expense'
      GROUP BY c.name
      ORDER BY total_expense DESC;
    `;
    const { rows } = await query(q, [userId]);
    res.json({ expensesByCategory: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function getYearlyTrend(req, res) {
  const userId = req.user.id;
  try {
    const q = `
      SELECT date_trunc('year', date) as year,
        SUM(CASE WHEN type='income' THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as total_expense
      FROM transactions
      WHERE user_id = $1
      GROUP BY year
      ORDER BY year DESC;
    `;
    const { rows } = await query(q, [userId]);
    res.json({ yearlyTrend: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

// Dashboard stats - Resumen general
export async function getDashboardStats(req, res) {
  const userId = req.user.id;

  try {
    // Balance total de todas las cuentas
    const accountsQ = 'SELECT COALESCE(SUM(balance), 0) as total_balance FROM accounts WHERE user_id = $1';
    const { rows: accountRows } = await query(accountsQ, [userId]);

    // Ingresos y gastos del mes actual
    const currentMonthQ = `
      SELECT
        COALESCE(SUM(CASE WHEN type='income' THEN amount ELSE 0 END), 0) as month_income,
        COALESCE(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END), 0) as month_expense
      FROM transactions
      WHERE user_id = $1
        AND date >= date_trunc('month', CURRENT_DATE)
        AND date < date_trunc('month', CURRENT_DATE) + interval '1 month'
    `;
    const { rows: monthRows } = await query(currentMonthQ, [userId]);

    // Comparación con mes anterior
    const lastMonthQ = `
      SELECT
        COALESCE(SUM(CASE WHEN type='income' THEN amount ELSE 0 END), 0) as last_month_income,
        COALESCE(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END), 0) as last_month_expense
      FROM transactions
      WHERE user_id = $1
        AND date >= date_trunc('month', CURRENT_DATE) - interval '1 month'
        AND date < date_trunc('month', CURRENT_DATE)
    `;
    const { rows: lastMonthRows } = await query(lastMonthQ, [userId]);

    // Total de transacciones
    const txCountQ = 'SELECT COUNT(*) as total_transactions FROM transactions WHERE user_id = $1';
    const { rows: txCountRows } = await query(txCountQ, [userId]);

    // Categoría con más gastos este mes
    const topCategoryQ = `
      SELECT c.name, SUM(t.amount) as total
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = $1
        AND t.type = 'expense'
        AND t.date >= date_trunc('month', CURRENT_DATE)
      GROUP BY c.name
      ORDER BY total DESC
      LIMIT 1
    `;
    const { rows: topCategoryRows } = await query(topCategoryQ, [userId]);

    // Metas de ahorro activas
    const goalsQ = `
      SELECT COUNT(*) as active_goals,
             COALESCE(SUM(target_amount - current_amount), 0) as remaining_amount
      FROM savings_goals
      WHERE user_id = $1
        AND current_amount < target_amount
        AND (deadline IS NULL OR deadline >= NOW())
    `;
    const { rows: goalsRows } = await query(goalsQ, [userId]);

    // Presupuestos excedidos este mes
    const budgetsQ = `
      SELECT COUNT(*) as exceeded_budgets
      FROM budgets b
      LEFT JOIN (
        SELECT category_id, SUM(amount) as spent
        FROM transactions
        WHERE user_id = $1
          AND type = 'expense'
          AND date >= date_trunc('month', CURRENT_DATE)
        GROUP BY category_id
      ) t ON b.category_id = t.category_id
      WHERE b.user_id = $1
        AND b.period = 'monthly'
        AND COALESCE(t.spent, 0) > b.limit_amount
    `;
    const { rows: budgetsRows } = await query(budgetsQ, [userId]);

    const stats = {
      total_balance: parseFloat(accountRows[0].total_balance),
      current_month: {
        income: parseFloat(monthRows[0].month_income),
        expense: parseFloat(monthRows[0].month_expense),
        balance: parseFloat(monthRows[0].month_income) - parseFloat(monthRows[0].month_expense)
      },
      last_month: {
        income: parseFloat(lastMonthRows[0].last_month_income),
        expense: parseFloat(lastMonthRows[0].last_month_expense)
      },
      comparison: {
        income_change: parseFloat(monthRows[0].month_income) - parseFloat(lastMonthRows[0].last_month_income),
        expense_change: parseFloat(monthRows[0].month_expense) - parseFloat(lastMonthRows[0].last_month_expense)
      },
      total_transactions: parseInt(txCountRows[0].total_transactions),
      top_expense_category: topCategoryRows[0] || null,
      savings_goals: {
        active: parseInt(goalsRows[0].active_goals),
        remaining_amount: parseFloat(goalsRows[0].remaining_amount)
      },
      exceeded_budgets: parseInt(budgetsRows[0].exceeded_budgets)
    };

    res.json({ stats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

// Gasto promedio diario
export async function getAverageDailyExpense(req, res) {
  const userId = req.user.id;
  const { days = 30 } = req.query;

  try {
    const q = `
      SELECT
        COALESCE(AVG(daily_total), 0) as average_daily_expense
      FROM (
        SELECT date_trunc('day', date) as day, SUM(amount) as daily_total
        FROM transactions
        WHERE user_id = $1
          AND type = 'expense'
          AND date >= CURRENT_DATE - interval '${parseInt(days)} days'
        GROUP BY day
      ) daily_expenses
    `;
    const { rows } = await query(q, [userId]);

    res.json({
      average_daily_expense: parseFloat(rows[0].average_daily_expense),
      period_days: parseInt(days)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

// Proyección de gastos mensuales
export async function getMonthlyProjection(req, res) {
  const userId = req.user.id;

  try {
    const q = `
      SELECT
        COALESCE(SUM(amount), 0) as current_expense,
        EXTRACT(DAY FROM CURRENT_DATE) as current_day,
        EXTRACT(DAY FROM (date_trunc('month', CURRENT_DATE) + interval '1 month - 1 day')) as total_days
      FROM transactions
      WHERE user_id = $1
        AND type = 'expense'
        AND date >= date_trunc('month', CURRENT_DATE)
    `;
    const { rows } = await query(q, [userId]);

    const currentExpense = parseFloat(rows[0].current_expense);
    const currentDay = parseFloat(rows[0].current_day);
    const totalDays = parseFloat(rows[0].total_days);

    const dailyAverage = currentExpense / currentDay;
    const projectedExpense = dailyAverage * totalDays;

    res.json({
      current_expense: currentExpense,
      projected_expense: projectedExpense,
      daily_average: dailyAverage,
      current_day: currentDay,
      total_days: totalDays
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

// Exportar transacciones a CSV
export async function exportTransactionsCSV(req, res) {
  const userId = req.user.id;
  const { from, to } = req.query;

  try {
    let q = `
      SELECT
        t.date,
        t.type,
        t.amount,
        t.currency,
        t.description,
        c.name as category,
        a.name as account
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN accounts a ON t.account_id = a.id
      WHERE t.user_id = $1
    `;

    const params = [userId];

    if (from) {
      params.push(from);
      q += ` AND t.date >= $${params.length}`;
    }

    if (to) {
      params.push(to);
      q += ` AND t.date <= $${params.length}`;
    }

    q += ' ORDER BY t.date DESC';

    const { rows } = await query(q, params);

    // Crear CSV
    const headers = ['Date', 'Type', 'Amount', 'Currency', 'Description', 'Category', 'Account'];
    const csvRows = [headers.join(',')];

    for (const row of rows) {
      const values = [
        row.date,
        row.type,
        row.amount,
        row.currency,
        `"${row.description || ''}"`,
        row.category || '',
        row.account || ''
      ];
      csvRows.push(values.join(','));
    }

    const csv = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=transactions-${Date.now()}.csv`);
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}