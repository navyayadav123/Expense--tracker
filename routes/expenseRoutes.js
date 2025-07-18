// GET /expenses POST /expenses PUT /expenses/:id DELETE /expenses/:id
const express = require('express');
const router = express.Router();
const  {authenticate} = require('../middleware/authMiddleware');

const { createExpense, getExpenses,updateExpense,deleteExpense} = require('../controllers/expenseController');


// Use routes with middleware
router.post('/', authenticate, createExpense);
router.get('/', authenticate, getExpenses);
router.put('/:id', authenticate, updateExpense);
router.delete('/:id', authenticate, deleteExpense);

module.exports = router;
