// routes/incomeRoutes.js
const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { authenticate } = require('../middleware/authMiddleware');
const { uploadSalarySlip, getMonthlyIncome } = require('../controllers/incomeController');

router.post('/upload-slip', authenticate, upload.single('salarySlip'), uploadSalarySlip);
router.get('/monthly', authenticate, getMonthlyIncome);

module.exports = router;