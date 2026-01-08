import { Pool } from "pg";
const connectionString =
  "postgresql://postgres:53v45T14n*28*@db.dtajmblqdjcnfuxkukzi.supabase.co:5432/postgres";
console.log("Using URL:", connectionString.replace(/:([^:@]+)@/, ":***@"));

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

const q = `
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';
ALTER TABLE users ADD COLUMN IF NOT EXISTS monthly_income NUMERIC;
ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
`;

(async () => {
  try {
    console.log("Connecting...");
    await pool.query(q);
    console.log("DONE: Migrations applied.");
    process.exit(0);
  } catch (e) {
    console.error("ERROR:", e);
    process.exit(1);
  }
})();
