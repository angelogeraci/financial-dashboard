const { validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const excelService = require('../services/excel');
const aiService = require('../services/openai');

exports.getAllTransactions = async (req, res) => {
  try {
    const { startDate, endDate, category, type, page = 1, limit = 10 } = req.query;
    
    const query = { user: req.user._id };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    if (category) query.category = category;
    if (type) query.type = type;
    
    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
      
    const total = await Transaction.countDocuments(query);
    
    res.json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions', error: error.message });
  }
};

exports.getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transaction', error: error.message });
  }
};

exports.createTransaction = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const transaction = new Transaction({
      ...req.body,
      user: req.user._id
    });
    
    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Error creating transaction', error: error.message });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Error updating transaction', error: error.message });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting transaction', error: error.message });
  }
};

exports.bulkDeleteTransactions = async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!Array.isArray(ids)) {
      return res.status(400).json({ message: 'ids must be an array' });
    }
    
    const result = await Transaction.deleteMany({ _id: { $in: ids }, user: req.user._id });
    
    res.json({ message: `${result.deletedCount} transactions deleted` });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting transactions', error: error.message });
  }
};

exports.uploadTransactions = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const data = await excelService.readExcelFile(req.file.path);
    const transactions = excelService.parseTransactions(data);
    
    // Check for duplicates
    const uniqueTransactions = await checkForDuplicates(transactions, req.user._id);
    
    // Save transactions
    const savedTransactions = await Transaction.insertMany(uniqueTransactions);
    
    res.json({
      message: `${savedTransactions.length} transactions imported successfully`,
      transactions: savedTransactions
    });
  } catch (error) {
    res.status(500).json({ message: 'Error processing file', error: error.message });
  }
};

const checkForDuplicates = async (transactions, userId) => {
  const uniqueTransactions = [];
  
  for (const transaction of transactions) {
    const existing = await Transaction.findOne({
      user: userId,
      date: transaction.date,
      amount: transaction.amount,
      description: transaction.description
    });
    
    if (!existing) {
      uniqueTransactions.push({
        ...transaction,
        user: userId
      });
    }
  }
  
  return uniqueTransactions;
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { name, type } = req.body;
    
    const category = new Category({
      name,
      type
    });
    
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error creating category', error: error.message });
  }
};

exports.categorizeTransactions = async (req, res) => {
  try {
    const { transactionIds } = req.body;
    
    if (!Array.isArray(transactionIds)) {
      return res.status(400).json({ message: 'transactionIds must be an array' });
    }
    
    const transactions = await Transaction.find({ 
      _id: { $in: transactionIds },
      user: req.user._id 
    });
    
    const categorizedTransactions = await aiService.categorizeTransactions(transactions);
    
    // Update transactions with AI-suggested categories
    for (const transaction of categorizedTransactions) {
      await Transaction.findOneAndUpdate(
        { _id: transaction._id },
        { category: transaction.suggestedCategory },
        { new: true }
      );
    }
    
    res.json({
      message: 'Transactions categorized successfully',
      transactions: categorizedTransactions
    });
  } catch (error) {
    res.status(500).json({ message: 'Error categorizing transactions', error: error.message });
  }
};
