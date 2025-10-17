import express from 'express';
import { authenticateJWT } from '../middleware/auth.js';
import { getUserById, updateUser } from '../controllers/userController.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Protected routes
router.use(authenticateJWT);

// Get user information
router.get('/:id', async (req, res) => {
  const userId = req.params.id;
  if (userId !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  return getUserById(req, res);
});

// Update user information
router.put('/:id', 
  body('name').optional().isString(),
  body('email').optional().isEmail(),
  async (req, res) => {
    const userId = req.params.id;
    if (userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const errs = validationResult(req);
    if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });
    return updateUser(req, res);
  }
);

export default router;