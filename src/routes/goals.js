import express from 'express';
import { authenticateJWT } from '../middleware/auth.js';
import * as controller from '../controllers/goalController.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Protected routes
router.use(authenticateJWT);

// Create goal
router.post('/',
  body('name').isString().notEmpty(),
  body('target_amount').isNumeric(),
  async (req, res) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });
    return controller.createGoal(req, res);
  }
);

// Get all goals
router.get('/', controller.getGoals);

// Get goal by ID
router.get('/:id', controller.getGoalById);

// Update goal
router.put('/:id', controller.updateGoal);

// Contribute to goal
router.post('/:id/contribute',
  body('amount').isNumeric(),
  async (req, res) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });
    return controller.contributeToGoal(req, res);
  }
);

// Delete goal
router.delete('/:id', controller.deleteGoal);

export default router;
