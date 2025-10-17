import express from "express";
import { body, validationResult } from "express-validator";
import { authenticateJWT } from "../middleware/auth.js";
import * as controller from "../controllers/categoryController.js";

const router = express.Router();

// quick sanity check: ensure controller functions exist
function ensureHandler(fn, name) {
  if (typeof fn !== "function")
    throw new Error(
      `Missing handler: ${name} in controllers/categoryController.js`
    );
  return fn;
}

// Public routes (if any) - otherwise protect
router.use(authenticateJWT);

// Create
router.post("/", body("name").isString().notEmpty(), (req, res, next) => {
  const errs = validationResult(req);
  if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });
  return ensureHandler(controller.createCategory, "createCategory")(
    req,
    res,
    next
  );
});

// List
router.get("/", (req, res, next) =>
  ensureHandler(controller.getCategories, "getCategories")(req, res, next)
);

// Get by id
router.get("/:id", (req, res, next) =>
  ensureHandler(controller.getCategoryById, "getCategoryById")(req, res, next)
);

// Update
router.put("/:id", body("name").optional().isString(), (req, res, next) =>
  ensureHandler(controller.updateCategory, "updateCategory")(req, res, next)
);

// Delete
router.delete("/:id", (req, res, next) =>
  ensureHandler(controller.deleteCategory, "deleteCategory")(req, res, next)
);

export default router;
