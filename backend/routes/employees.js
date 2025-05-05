const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const employeeController = require('../controllers/employeeController');
const auth = require('../middleware/auth');

// Validation schemas
const employeeValidation = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('position').trim().notEmpty().withMessage('Position is required'),
  body('department').trim().notEmpty().withMessage('Department is required'),
  body('hireDate').isISO8601().withMessage('Valid hire date is required'),
  body('employmentType').isIn(['full-time', 'part-time', 'contract', 'freelance', 'intern']).withMessage('Invalid employment type')
];

const costValidation = [
  body('name').trim().notEmpty().withMessage('Cost name is required'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('frequency').isIn(['monthly', 'yearly']).withMessage('Invalid frequency'),
  body('category').isIn(['salary', 'benefits', 'transport', 'equipment', 'training', 'other']).withMessage('Invalid category')
];

// Routes
router.get('/', auth, employeeController.getAllEmployees);
router.get('/:id', auth, employeeController.getEmployee);
router.post('/', auth, employeeValidation, employeeController.createEmployee);
router.put('/:id', auth, employeeValidation, employeeController.updateEmployee);
router.delete('/:id', auth, employeeController.deleteEmployee);

// Cost management routes
router.post('/:id/costs', auth, costValidation, employeeController.addEmployeeCost);
router.put('/:id/costs/:costId', auth, costValidation, employeeController.updateEmployeeCost);
router.delete('/:id/costs/:costId', auth, employeeController.deleteEmployeeCost);

// Employee cost analysis
router.get('/analysis/total-costs', auth, employeeController.getTotalEmployeeCosts);
router.get('/analysis/by-department', auth, employeeController.getCostsByDepartment);

module.exports = router;
