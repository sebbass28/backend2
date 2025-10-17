import { query } from "../db.js";
import fs from "fs";
import { supabase } from "../supabaseClient.js";

export async function createTransaction(req, res) {
  const userId = req.user.id;
  const {
    type,
    amount,
    currency = "EUR",
    category_id = null,
    description,
    date,
  } = req.body;
  try {
    const q = `INSERT INTO transactions (user_id,type,amount,currency,category_id,description,date)
      VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`;
    const { rows } = await query(q, [
      userId,
      type,
      amount,
      currency,
      category_id,
      description,
      date || new Date(),
    ]);
    const tx = rows[0];

    // emit realtime event to user's room
    if (global.io)
      global.io.to(`user_${userId}`).emit("transaction_created", tx);

    res.json({ transaction: tx });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

export async function getTransactions(req, res) {
  const userId = req.user.id;
  const { limit = 100, offset = 0, from, to, category } = req.query;
  try {
    let q =
      "SELECT t.*, c.name as category_name FROM transactions t LEFT JOIN categories c ON c.id = t.category_id WHERE t.user_id = $1";
    const params = [userId];
    if (from) {
      params.push(from);
      q += ` AND t.date >= $${params.length}`;
    }
    if (to) {
      params.push(to);
      q += ` AND t.date <= $${params.length}`;
    }
    if (category) {
      params.push(category);
      q += ` AND t.category_id = $${params.length}`;
    }
    params.push(limit);
    params.push(offset);
    q += ` ORDER BY t.date DESC LIMIT $${params.length - 1} OFFSET $${
      params.length
    }`;

    const { rows } = await query(q, params);
    res.json({ transactions: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

export async function getTransactionById(req, res) {
  const userId = req.user.id;
  const id = req.params.id;
  try {
    const q = "SELECT * FROM transactions WHERE id=$1 AND user_id=$2";
    const { rows } = await query(q, [id, userId]);
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json({ transaction: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

export async function updateTransaction(req, res) {
  const userId = req.user.id;
  const id = req.params.id;
  const fields = req.body;
  try {
    // Build SET dynamically (safe)
    const setParts = [];
    const vals = [];
    let idx = 1;
    for (const key of [
      "type",
      "amount",
      "currency",
      "category_id",
      "description",
      "date",
      "receipt_url",
    ]) {
      if (fields[key] !== undefined) {
        setParts.push(`${key}=$${idx++}`);
        vals.push(fields[key]);
      }
    }
    if (!setParts.length) return res.status(400).json({ error: "No fields" });
    vals.push(id);
    vals.push(userId);
    const q = `UPDATE transactions SET ${setParts.join(
      ", "
    )} WHERE id=$${idx++} AND user_id=$${idx} RETURNING *`;
    const { rows } = await query(q, vals);
    if (!rows.length)
      return res.status(404).json({ error: "Not found or unauthorized" });

    // emit realtime
    if (global.io)
      global.io.to(`user_${userId}`).emit("transaction_updated", rows[0]);

    res.json({ transaction: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

export async function deleteTransaction(req, res) {
  const userId = req.user.id;
  const id = req.params.id;
  try {
    const q = "DELETE FROM transactions WHERE id=$1 AND user_id=$2 RETURNING *";
    const { rows } = await query(q, [id, userId]);
    if (!rows.length) return res.status(404).json({ error: "Not found" });

    if (global.io)
      global.io.to(`user_${userId}`).emit("transaction_deleted", { id });

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

export async function uploadReceipt(req, res) {
  const userId = req.user.id;
  const id = req.params.id;
  if (!req.file) return res.status(400).json({ error: "No file" });

  const BUCKET = process.env.SUPABASE_BUCKET || "recivos"; // usa tu bucket privado

  try {
    const fileBuffer = fs.readFileSync(req.file.path);
    const remotePath = `${userId}/${Date.now()}-${req.file.filename}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(remotePath, fileBuffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    // eliminar archivo temporal local
    try {
      fs.unlinkSync(req.file.path);
    } catch (e) {}

    if (uploadError) {
      console.error("Supabase upload error", uploadError);
      return res.status(500).json({ error: "Upload failed" });
    }

    // Guardamos la ruta remota (remotePath) en la BD (no guardes la signed URL porque expira)
    const q =
      "UPDATE transactions SET receipt_url=$1 WHERE id=$2 AND user_id=$3 RETURNING *";
    const { rows } = await query(q, [remotePath, id, userId]);
    if (!rows.length)
      return res.status(404).json({ error: "Not found or unauthorized" });

    // Generar signed URL temporal (ej. 1 hora) para devolver al cliente inmediatamente
    const ttl = Number(process.env.SIGNED_URL_TTL_SEC || 3600);
    const { data: signedData, error: signedError } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(remotePath, ttl);

    if (signedError) {
      console.error("Signed URL error", signedError);
      // devolvemos la transacción aunque no haya signed URL
      return res.json({ transaction: rows[0], signedUrl: null });
    }

    res.json({
      transaction: rows[0],
      signedUrl: signedData?.signedUrl || null,
      expires_in: ttl,
    });
  } catch (err) {
    console.error(err);
    try {
      if (req.file && req.file.path) fs.unlinkSync(req.file.path);
    } catch (_) {}
    res.status(500).json({ error: "Server error" });
  }
}

// Nuevo método: obtener signed URL para un recibo existente
export async function getReceiptSignedUrl(req, res) {
  const userId = req.user.id;
  const id = req.params.id;
  const BUCKET = process.env.SUPABASE_BUCKET || "recivos";

  try {
    const q = "SELECT receipt_url FROM transactions WHERE id=$1 AND user_id=$2";
    const { rows } = await query(q, [id, userId]);
    if (!rows.length)
      return res.status(404).json({ error: "Not found or unauthorized" });

    const remotePath = rows[0].receipt_url;
    if (!remotePath)
      return res.status(404).json({ error: "No receipt uploaded" });

    const ttl = Number(process.env.SIGNED_URL_TTL_SEC || 3600);
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(remotePath, ttl);
    if (error) {
      console.error("Signed URL error", error);
      return res.status(500).json({ error: "Could not create signed URL" });
    }

    res.json({ signedUrl: data?.signedUrl || null, expires_in: ttl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}
