import { query } from "../db.js";

export async function createCategory(req, res) {
  const userId = req.user.id;
  const { name, color = null } = req.body;
  try {
    const q =
      "INSERT INTO categories (user_id,name,color) VALUES ($1,$2,$3) RETURNING *";
    const { rows } = await query(q, [userId, name, color]);
    res.json({ category: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

export async function getCategories(req, res) {
  const userId = req.user.id;
  try {
    const q =
      "SELECT * FROM categories WHERE user_id IS NULL OR user_id=$1 ORDER BY name";
    const { rows } = await query(q, [userId]);
    res.json({ categories: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

export async function getCategoryById(req, res) {
  const userId = req.user.id;
  const id = req.params.id;
  try {
    const q =
      "SELECT * FROM categories WHERE id=$1 AND (user_id IS NULL OR user_id=$2)";
    const { rows } = await query(q, [id, userId]);
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json({ category: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

export async function updateCategory(req, res) {
  const userId = req.user.id;
  const id = req.params.id;
  const { name, color } = req.body;
  try {
    const q =
      "UPDATE categories SET name=$1, color=$2 WHERE id=$3 AND user_id=$4 RETURNING *";
    const { rows } = await query(q, [name, color, id, userId]);
    if (!rows.length)
      return res.status(404).json({ error: "Not found or unauthorized" });
    res.json({ category: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

export async function deleteCategory(req, res) {
  const userId = req.user.id;
  const id = req.params.id;
  try {
    const q = "DELETE FROM categories WHERE id=$1 AND user_id=$2 RETURNING *";
    const { rows } = await query(q, [id, userId]);
    if (!rows.length)
      return res.status(404).json({ error: "Not found or unauthorized" });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}
