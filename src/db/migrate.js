import { query } from '../db.js';

export async function runMigrations() {
  console.log('Checking for database migrations...');
  
  const migrations = [
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS country TEXT;`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS monthly_income NUMERIC;`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date DATE;`
  ];

  for (const sql of migrations) {
    try {
      await query(sql);
      // console.log(`Executed: ${sql}`);
    } catch (err) {
      console.error(`Migration failed: ${sql}`, err.message);
    }
  }
  
  console.log('Database migrations completed.');
}
