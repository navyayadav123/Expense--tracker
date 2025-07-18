const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: function() {
      return !this.salarySlip;
    }
  },
  salarySlip: {
    type: String, // File path or URL
    required: function() {
      return !this.amount;
    }
  },
  month: {
    type: String, // e.g., "2024-06"
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Income', incomeSchema);