import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
console.log("Debug DB URL:", connectionString ? "Found" : "Missing");

const pool = new Pool({
  connectionString,
  ssl: connectionString ? { rejectUnauthorized: false } : false,
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
    console.log("Iniciando actualización...");
    await pool.query(q);
    console.log("✅ Columnas añadidas correctamente a users.");
    process.exit(0);
  } catch (e) {
    console.error("❌ Error actualizando users:", e);
    process.exit(1);
  }
})();
