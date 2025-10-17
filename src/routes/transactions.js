import express from "express";
import multer from "multer";
import { authenticateJWT } from "../middleware/auth.js";
import * as controller from "../controllers/transactionController.js";
import { body, validationResult } from "express-validator";
import path from "path";
import fs from "fs";

const router = express.Router();

// setup multer
const uploadDir = process.env.UPLOAD_DIR || "./src/uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
  },
});
const upload = multer({ storage });

// Protected routes
router.use(authenticateJWT);

router.post(
  "/",
  body("type").isIn(["income", "expense"]),
  body("amount").isNumeric(),
  async (req, res) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });
    return controller.createTransaction(req, res);
  }
);

router.get("/", controller.getTransactions);
router.get("/:id", controller.getTransactionById);

router.put("/:id", async (req, res) => controller.updateTransaction(req, res));
router.delete("/:id", controller.deleteTransaction);

// upload receipt
router.post("/:id/receipt", upload.single("receipt"), controller.uploadReceipt);

// Nuevo: obtener signed URL para el recibo (protegido)
router.get("/:id/receipt", controller.getReceiptSignedUrl);

export default router;
