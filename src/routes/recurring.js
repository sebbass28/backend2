import express from 'express';
import { authenticateJWT } from '../middleware/auth.js';
import * as controller from '../controllers/recurringController.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Protected routes
router.use(authenticateJWT);

// Create recurring transaction
router.post('/',
  body('type').isIn(['income', 'expense']),
  body('amount').isNumeric(),
  body('frequency').isIn(['daily', 'weekly', 'monthly', 'yearly']),
  body('start_date').isISO8601(),
  async (req, res) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });
    return controller.createRecurring(req, res);
  }
);

// Get all recurring transactions
router.get('/', controller.getRecurrings);

// Get recurring by ID
router.get('/:id', controller.getRecurringById);

// Update recurring
router.put('/:id', controller.updateRecurring);

// Delete recurring
router.delete('/:id', controller.deleteRecurring);

// Execute recurring (create actual transaction)
router.post('/:id/execute', controller.executeRecurring);

export default router;
