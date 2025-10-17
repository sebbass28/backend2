import express from 'express';
import { authenticateJWT } from '../middleware/auth.js';
import * as controller from '../controllers/accountController.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Protected routes
router.use(authenticateJWT);

// Create account
router.post('/',
  body('name').isString().notEmpty(),
  body('type').optional().isIn(['cash', 'bank', 'credit_card', 'savings', 'investment']),
  async (req, res) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });
    return controller.createAccount(req, res);
  }
);

// Get all accounts
router.get('/', controller.getAccounts);

// Get account by ID
router.get('/:id', controller.getAccountById);

// Update account
router.put('/:id', controller.updateAccount);

// Delete account
router.delete('/:id', controller.deleteAccount);

// Transfer between accounts
router.post('/transfers',
  body('from_account_id').isUUID(),
  body('to_account_id').isUUID(),
  body('amount').isNumeric(),
  async (req, res) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });
    return controller.transferBetweenAccounts(req, res);
  }
);

// Get transfers history
router.get('/transfers/history', controller.getTransfers);

export default router;
