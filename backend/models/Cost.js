const mongoose = require('mongoose');

const costSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  frequency: {
    type: String,
    enum: ['one-time', 'daily', 'weekly', 'monthly', 'yearly'],
    required: true
  },
  startDate: {
    type: Date,
    required: function() {
      return this.frequency !== 'one-time';
    }
  },
  endDate: {
    type: Date,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return v > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    trim: true
  },
  relatedEmployee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Virtual for calculating total cost over a period
costSchema.virtual('totalCost').get(function() {
  const calculateTotal = () => {
    switch (this.frequency) {
      case 'one-time':
        return this.amount;
      case 'daily':
        return this.amount * 365;
      case 'weekly':
        return this.amount * 52;
      case 'monthly':
        return this.amount * 12;
      case 'yearly':
        return this.amount;
      default:
        return 0;
    }
  };
  
  return calculateTotal();
});

// Indexes
costSchema.index({ user: 1, category: 1 });
costSchema.index({ frequency: 1 });
costSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model('Cost', costSchema);
