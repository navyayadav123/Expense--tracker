const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { createBudgetPlan, getBudgetPlan } = require('../controllers/budgetController');

// Create or update budget plan
router.post('/plan', authenticate, createBudgetPlan);

// Get budget plan for a specific month
router.get('/plan', authenticate, getBudgetPlan);

module.exports = router; 