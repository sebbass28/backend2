import { body } from 'express-validator';

export const registerValidator = [
  body('email').isEmail().withMessage('Email is not valid'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('name').optional().isString().withMessage('Name must be a string'),
];

export const loginValidator = [
  body('email').isEmail().withMessage('Email is not valid'),
  body('password').exists().withMessage('Password is required'),
];

export const transactionValidator = [
  body('type').isIn(['income', 'expense']).withMessage('Type must be either income or expense'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('currency').optional().isString().withMessage('Currency must be a string'),
  body('category_id').optional().isUUID().withMessage('Category ID must be a valid UUID'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('date').optional().isISO8601().withMessage('Date must be a valid ISO 8601 date'),
];

export const budgetValidator = [
  body('limit_amount').isNumeric().withMessage('Limit amount must be a number'),
  body('period').isIn(['monthly', 'yearly', 'weekly']).withMessage('Period must be either monthly, yearly, or weekly'),
  body('category_id').optional().isUUID().withMessage('Category ID must be a valid UUID'),
];

export const categoryValidator = [
  body('name').isString().withMessage('Name must be a string'),
  body('color').optional().isString().withMessage('Color must be a string'),
];