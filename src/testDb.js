import { query, pool } from "./db.js";
(async () => {
  try {
    const res = await query("SELECT now() as now");
    console.log("DB OK, now =", res.rows[0].now);
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error("DB connection error:", err.message || err);
    process.exit(1);
  }
})();
