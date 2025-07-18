const mongoose = require('mongoose');

const fixedExpenseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true }
}, { _id: false });

const budgetPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  month: {
    type: String, // e.g., "2024-06"
    required: true,
  },
  fixedExpenses: [fixedExpenseSchema],
  savingsGoal: {
    type: Number,
    required: true,
  },
  spendable: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('BudgetPlan', budgetPlanSchema); 