const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const costController = require('../controllers/costController');
const auth = require('../middleware/auth');

// Validation schemas
const costValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('frequency').isIn(['one-time', 'daily', 'weekly', 'monthly', 'yearly']).withMessage('Invalid frequency'),
  body('startDate').optional().isISO8601().withMessage('Invalid start date'),
  body('endDate').optional().isISO8601().withMessage('Invalid end date')
];

// Routes
router.get('/', auth, costController.getAllCosts);
router.get('/:id', auth, costController.getCost);
router.post('/', auth, costValidation, costController.createCost);
router.put('/:id', auth, costValidation, costController.updateCost);
router.delete('/:id', auth, costController.deleteCost);

// Cost estimation and analysis
router.get('/estimate/monthly', auth, costController.getMonthlyEstimate);
router.get('/estimate/yearly', auth, costController.getYearlyEstimate);

module.exports = router;
