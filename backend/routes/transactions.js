const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { body } = require('express-validator');
const transactionController = require('../controllers/transactionController');
const auth = require('../middleware/auth');

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /xlsx|xls|csv/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only Excel and CSV files are allowed!'));
  }
};

const upload = multer({ 
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || '10') * 1024 * 1024 },
  fileFilter
});

// Validation schemas
const transactionValidation = [
  body('date').isISO8601().withMessage('Invalid date format'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('type').isIn(['income', 'expense']).withMessage('Invalid transaction type'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('paymentMethod').isIn(['cash', 'credit', 'debit', 'transfer', 'check', 'other']).withMessage('Invalid payment method')
];

// Routes
router.get('/', auth, transactionController.getAllTransactions);
router.get('/:id', auth, transactionController.getTransaction);
router.post('/', auth, transactionValidation, transactionController.createTransaction);
router.put('/:id', auth, transactionValidation, transactionController.updateTransaction);
router.delete('/:id', auth, transactionController.deleteTransaction);
router.delete('/bulk', auth, transactionController.bulkDeleteTransactions);

// File upload and processing
router.post('/upload', auth, upload.single('file'), transactionController.uploadTransactions);

// Categories management
router.get('/categories/list', auth, transactionController.getCategories);
router.post('/categories', auth, [
  body('name').trim().notEmpty().withMessage('Category name is required'),
  body('type').isIn(['custom', 'default']).withMessage('Invalid category type')
], transactionController.createCategory);

// AI categorization
router.post('/categorize', auth, transactionController.categorizeTransactions);

module.exports = router;
