import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { query } from "../db.js";

dotenv.config();

export async function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token" });

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Strict Session Check
    if (payload.sessionId) {
      const { rows } = await query("SELECT id FROM sessions WHERE id=$1", [
        payload.sessionId,
      ]);
      if (rows.length === 0) {
        return res.status(401).json({ error: "Session revoked" });
      }
    } else {
      // Force re-login for old tokens to ensuring system integrity
      return res.status(401).json({ error: "Token deprecated" });
    }

    req.user = payload;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }
    console.error(err);
    return res.status(401).json({ error: "Invalid token" });
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  if (req.user.role !== "admin")
    return res.status(403).json({ error: "Forbidden" });
  next();
}
