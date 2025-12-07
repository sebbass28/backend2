import express from 'express';
import { body, validationResult } from 'express-validator';
import { register, login, refreshToken, logout, forgotPassword, resetPassword, getProfile, changePassword } from '../controllers/authController.js';
import { authenticateJWT } from '../middleware/auth.js';
const router = express.Router();

router.get('/me', authenticateJWT, getProfile);

router.post('/change-password', 
  authenticateJWT, 
  body('currentPassword').exists(),
  body('newPassword').isLength({ min: 6 }),
  async (req, res) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });
    return changePassword(req, res);
  }
);

router.post('/register',
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  async (req, res) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });
    return register(req, res);
  });

router.post('/login',
  body('email').isEmail(),
  body('password').exists(),
  async (req, res) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });
    return login(req, res);
  });

router.post('/refresh', refreshToken);
router.post('/logout', logout);

router.post('/forgot-password',
  body('email').isEmail(),
  async (req, res) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });
    return forgotPassword(req, res);
  });

router.post('/reset-password',
  body('token').exists(),
  body('newPassword').isLength({ min: 6 }),
  async (req, res) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });
    return resetPassword(req, res);
  });

export default router;