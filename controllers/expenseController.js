// CRUD logic for expenses (create, read, update, delete).
const mongoose = require('mongoose');
const Expense = require('../models/Expense');
const { getCache, setCache, deleteCache } = require('../utils/cache');
const sendMail = require('../utils/mailer');
const User = require('../models/User');
const BudgetPlan = require('../models/BudgetPlan');
const Income = require('../models/Income');
const generateMonthlyReport = require('../utils/pdfReport');
const path = require('path');

//  CREATE a new expense
exports.createExpense = async (req, res) => {
  try {
    const {
      amount,
      category,
      date,
      description,
      paymentMethod,
      isRecurring,
      recurrence,
      attachment,
      tags,
      status,
      budgetMonth,
      notificationSent
    } = req.body;
    const userId = req.user.userId; //user's ID from the JWT token
    const expense = new Expense({
      user: new mongoose.Types.ObjectId(userId),
      amount,
      category,
      date,
      description,
      paymentMethod,
      isRecurring,
      recurrence,
      attachment,
      tags,
      status,
      budgetMonth,
      notificationSent
    });
    await expense.save();
    await deleteCache(`expenses:${userId}`);

    // Fetch user, budget, and income info
    const user = await User.findById(userId);
    const budgetPlan = await BudgetPlan.findOne({ user: userId, month: budgetMonth });
    const income = await Income.findOne({ user: userId, month: budgetMonth });

    // Calculate total expenses for the month
    const totalExpenses = await Expense.aggregate([
      { $match: { user: user._id, budgetMonth } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const spent = totalExpenses[0]?.total || 0;

    // Check if spending from savings
    if (budgetPlan && income && spent > (income.amount - budgetPlan.savingsGoal)) {
      await sendMail(
        user.email,
        'Alert: You are using your savings!',
        'You have started spending from your savings. Please review your expenses.'
      );
    }

    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET all expenses
exports.getExpenses = async (req, res) => {
  const userId =  req.user.userId;
  console.log("userId:", userId);
  const cacheKey = `expenses:${userId}`;
  try {
    // Check Redis cache first
    const cachedExpenses = await getCache(cacheKey);
    if (cachedExpenses) {
      console.log(' Data Fetched from Redis cache');
      return res.json(cachedExpenses);
    }
    const expenses = await Expense.find({ user: userId }).sort({ date: -1 });
    await setCache(cacheKey, expenses, 3600);
    console.log('Data cached in Redis');
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

//   UPDATE an expense
exports.updateExpense = async (req, res) => {
  try {
    const {
      amount,
      category,
      date,
      description,
      paymentMethod,
      isRecurring,
      recurrence,
      attachment,
      tags,
      status,
      budgetMonth,
      notificationSent
    } = req.body;
    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      {
        amount,
        category,
        date,
        description,
        paymentMethod,
        isRecurring,
        recurrence,
        attachment,
        tags,
        status,
        budgetMonth,
        notificationSent
      },
      { new: true }
    );
    if (updatedExpense) {
      await deleteCache(`expenses:${updatedExpense.user}`);
    }
    res.json(updatedExpense);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

//  DELETE an expense
exports.deleteExpense = async (req, res) => {
  try {
    const deletedExpense = await Expense.findByIdAndDelete(req.params.id);
    if (deletedExpense) {
      await deleteCache(`expenses:${deletedExpense.user}`); // Clear related cache
    }
    res.json({ message: 'Expense deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Add this new controller function
exports.downloadMonthlyReport = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { month } = req.query; // e.g., "2024-06"
    const user = await User.findById(userId);
    const expenses = await Expense.find({ user: userId, budgetMonth: month });
    const income = await Income.findOne({ user: userId, month });
    const budgetPlan = await BudgetPlan.findOne({ user: userId, month });

    const outputPath = path.join(__dirname, `../reports/${userId}_${month}_report.pdf`);
    await generateMonthlyReport({
      expenses,
      income,
      budgetPlan,
      month,
      userName: user.name
    }, outputPath);

    res.download(outputPath, `Expense_Report_${month}.pdf`, err => {
      if (err) {
        res.status(500).send('Could not download the file.');
      }
      // Optionally, delete the file after sending
      // fs.unlinkSync(outputPath);
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
