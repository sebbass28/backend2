import express from 'express';
import { authenticateJWT } from '../middleware/auth.js';
import * as controller from '../controllers/budgetController.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Protected routes
router.use(authenticateJWT);

// Create a new budget
router.post('/', 
  body('category_id').isUUID(),
  body('limit_amount').isNumeric(),
  async (req, res) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });
    return controller.createBudget(req, res);
});

// Get all budgets
router.get('/', controller.getBudgets);

// Get a budget by ID
router.get('/:id', controller.getBudgetById);

// Update a budget
router.put('/:id', async (req, res) => controller.updateBudget(req, res));

// Delete a budget
router.delete('/:id', async (req, res) => controller.deleteBudget(req, res));

export default router;