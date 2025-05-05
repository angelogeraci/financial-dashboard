const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

// Dashboard statistics routes
router.get('/overview', auth, dashboardController.getOverview);
router.get('/revenue-evolution', auth, dashboardController.getRevenueEvolution);
router.get('/revenue-distribution', auth, dashboardController.getRevenueDistribution);
router.get('/expenses-by-category', auth, dashboardController.getExpensesByCategory);
router.get('/net-profit', auth, dashboardController.getNetProfit);
router.get('/cash-flow', auth, dashboardController.getCashFlow);
router.get('/accounts-receivable', auth, dashboardController.getAccountsReceivable);
router.get('/financial-ratios', auth, dashboardController.getFinancialRatios);
router.get('/budget-vs-actual', auth, dashboardController.getBudgetVsActual);
router.get('/sector-specific', auth, dashboardController.getSectorSpecificMetrics);

// AI-powered insights
router.get('/insights', auth, dashboardController.getAIInsights);
router.get('/recommendations', auth, dashboardController.getRecommendations);

// Export data
router.get('/export', auth, dashboardController.exportDashboardData);

module.exports = router;
