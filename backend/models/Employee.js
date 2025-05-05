const mongoose = require('mongoose');

// Cost details schema for employee-related costs
const employeeCostSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  frequency: {
    type: String,
    enum: ['monthly', 'yearly'],
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['salary', 'benefits', 'transport', 'equipment', 'training', 'other']
  },
  taxDeductible: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    trim: true
  }
}, { _id: true });

const employeeSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  position: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  hireDate: {
    type: Date,
    required: true
  },
  employmentType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'freelance', 'intern'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'on-leave', 'terminated'],
    default: 'active'
  },
  costs: [employeeCostSchema],
  totalMonthlyCost: {
    type: Number,
    default: 0
  },
  totalYearlyCost: {
    type: Number,
    default: 0
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Virtual for full name
employeeSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Calculate total costs (middleware)
employeeSchema.pre('save', function(next) {
  this.totalMonthlyCost = 0;
  this.totalYearlyCost = 0;
  
  this.costs.forEach(cost => {
    if (cost.frequency === 'monthly') {
      this.totalMonthlyCost += cost.amount;
      this.totalYearlyCost += cost.amount * 12;
    } else if (cost.frequency === 'yearly') {
      this.totalMonthlyCost += cost.amount / 12;
      this.totalYearlyCost += cost.amount;
    }
  });
  
  next();
});

// Indexes
employeeSchema.index({ user: 1, email: 1 });
employeeSchema.index({ user: 1, department: 1 });
employeeSchema.index({ status: 1 });

module.exports = mongoose.model('Employee', employeeSchema);
