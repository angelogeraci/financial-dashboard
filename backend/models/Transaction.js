const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  subcategory: {
    type: String,
    trim: true
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit', 'debit', 'transfer', 'check', 'other'],
    required: true
  },
  reference: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
  },
  recurringStartDate: {
    type: Date
  },
  recurringEndDate: {
    type: Date
  },
  isVerified: {
    type: Boolean,
    default: true
  },
  sourceFile: {
    type: String,
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalId: {
    type: String,  // For duplicate detection from Excel uploads
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for faster queries
transactionSchema.index({ date: 1, user: 1 });
transactionSchema.index({ category: 1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ originalId: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
