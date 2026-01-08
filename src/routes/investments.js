import express from 'express';
import { authenticateJWT } from '../middleware/auth.js';
import * as controller from '../controllers/investmentController.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Protected routes
router.use(authenticateJWT);

// Create investment
router.post('/',
  body('name').isString().notEmpty(),
  body('type').optional().isIn(['stock', 'crypto', 'bond', 'fund', 'other']),
  body('symbol').isString().notEmpty(),
  body('quantity').isNumeric(),
  body('purchasePrice').isNumeric(),
  body('purchaseDate').optional().isISO8601(),
  async (req, res) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });
    return controller.createInvestment(req, res);
  }
);

// Get all investments
router.get('/', controller.getInvestments);

// Get investment by ID
router.get('/:id', controller.getInvestmentById);

// Update investment
router.put('/:id', controller.updateInvestment);

// Delete investment
router.delete('/:id', controller.deleteInvestment);

export default router;
