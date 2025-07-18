const BudgetPlan = require('../models/BudgetPlan');
const Income = require('../models/Income');

// Create or update a budget plan
exports.createBudgetPlan = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { month, fixedExpenses, savingsGoal } = req.body;

    // Get the user's monthly income
    const income = await Income.findOne({ user: userId, month });
    if (!income) {
      return res.status(404).json({ 
        message: 'No income found for this month. Please add your income first.' 
      });
    }

    // Calculate total fixed expenses
    const totalFixedExpenses = fixedExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Calculate spendable amount
    const spendable = income.amount - totalFixedExpenses - savingsGoal;

    if (spendable < 0) {
      return res.status(400).json({ 
        message: 'Your fixed expenses and savings goal exceed your income. Please adjust your budget.' 
      });
    }

    // Create or update budget plan
    const budgetPlan = await BudgetPlan.findOneAndUpdate(
      { user: userId, month },
      {
        fixedExpenses,
        savingsGoal,
        spendable,
      },
      { new: true, upsert: true }
    );

    res.status(201).json(budgetPlan);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get budget plan for a specific month
exports.getBudgetPlan = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { month } = req.query;

    if (!month) {
      return res.status(400).json({ message: 'Month query parameter is required.' });
    }

    const budgetPlan = await BudgetPlan.findOne({ user: userId, month });
    if (!budgetPlan) {
      return res.status(404).json({ message: 'No budget plan found for this month.' });
    }

    res.json(budgetPlan);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 