const Income = require('../models/Income');
const pdfParse = require('pdf-parse');
const fs = require('fs');

exports.uploadSalarySlip = async (req, res) => {
  try {
    const { month, amount } = req.body;
    const userId = req.user.userId;
    let salarySlipPath = req.file ? req.file.path : null;
    let incomeAmount = amount ? parseFloat(amount) : null;

    // If a file is uploaded and amount is not provided, try to extract from PDF
    if (salarySlipPath && !incomeAmount) {
      const dataBuffer = fs.readFileSync(salarySlipPath);
      const pdfData = await pdfParse(dataBuffer);

      // Simple regex to find a number (customize for your slip format)
      const match = pdfData.text.match(/(?:Net Pay|Total|Amount)[^\d]*(\d+[,.]?\d*)/i);
      incomeAmount = match ? parseFloat(match[1].replace(/,/g, '')) : null;
    }

    if (!incomeAmount && !salarySlipPath) {
      return res.status(400).json({ message: 'Please provide a salary slip or an amount.' });
    }

    const income = new Income({
      user: userId,
      amount: incomeAmount,
      salarySlip: salarySlipPath,
      month,
    });

    await income.save();
    res.status(201).json(income);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getMonthlyIncome = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { month } = req.query;
    if (!month) {
      return res.status(400).json({ message: 'Month query parameter is required.' });
    }
    const income = await Income.findOne({ user: userId, month });
    if (!income) {
      return res.status(404).json({ message: 'No income found for this month.' });
    }
    res.json(income);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};