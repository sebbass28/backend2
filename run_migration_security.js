import { query, pool } from "./src/db.js";
import fs from "fs";
import path from "path";

async function run() {
  try {
    const sqlPath = path.join(process.cwd(), "migration_security.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");

    console.log("Running migration...");
    console.log(sql);

    await query(sql);

    console.log("Migration completed successfully.");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    pool.end();
  }
}

run();
