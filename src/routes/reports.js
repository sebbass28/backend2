import express from 'express';
import { authenticateJWT } from '../middleware/auth.js';
import * as reportController from '../controllers/reportController.js';

const router = express.Router();

// Protected routes
router.use(authenticateJWT);

// Get monthly balance report
router.get('/monthly-balance', reportController.getMonthlyBalance);

// Get expenses by category report
router.get('/expenses-by-category', reportController.getExpensesByCategory);

// Get yearly trend report
router.get('/yearly-trend', reportController.getYearlyTrend);

// Dashboard stats
router.get('/dashboard-stats', reportController.getDashboardStats);

// Average daily expense
router.get('/average-daily-expense', reportController.getAverageDailyExpense);

// Monthly projection
router.get('/monthly-projection', reportController.getMonthlyProjection);

// Export to CSV
router.get('/export-csv', reportController.exportTransactionsCSV);

export default router;