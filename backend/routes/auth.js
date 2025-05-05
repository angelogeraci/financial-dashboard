const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Validation middleware
const loginValidation = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const registerValidation = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required')
];

// Public routes
router.post('/login', loginValidation, authController.login);
router.post('/register', registerValidation, authController.register);

// Protected routes
router.get('/me', auth, authController.getCurrentUser);
router.put('/me', auth, authController.updateUser);
router.put('/change-password', auth, [
  body('currentPassword').isLength({ min: 6 }),
  body('newPassword').isLength({ min: 6 })
], authController.changePassword);

module.exports = router;
