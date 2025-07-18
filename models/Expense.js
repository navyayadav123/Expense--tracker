const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true, // e.g., 'Food', 'Transport', 'Rent', etc.
  },
  date: {
    type: Date,
    default: Date.now,
  },
  description: {
    type: String,
  },
  paymentMethod: {
    type: String, // e.g., 'Cash', 'Card', 'UPI', etc.
  },
  isRecurring: {
    type: Boolean,
    default: false,
  },
  recurrence: {
    type: String, // e.g., 'monthly', 'weekly', etc. (if isRecurring is true)
  },
  attachment: {
    type: String, // file path or URL for receipt/bill
  },
  tags: [{
    type: String,
  }],
  status: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'paid',
  },
  budgetMonth: {
    type: String, // e.g., '2024-06' to link to a budget plan
  },
  notificationSent: {
    type: Boolean,
    default: false, // for overspending or reminders
  }
});

module.exports = mongoose.model('Expense', expenseSchema);
