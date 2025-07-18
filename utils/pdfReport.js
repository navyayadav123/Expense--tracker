const PDFDocument = require('pdfkit');
const fs = require('fs');

function generateMonthlyReport({ expenses, income, budgetPlan, month, userName }, outputPath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    doc.fontSize(20).text(`Monthly Expense Report: ${month}`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`User: ${userName}`);
    doc.text(`Income: ₹${income ? income.amount : 0}`);
    doc.text(`Savings Goal: ₹${budgetPlan ? budgetPlan.savingsGoal : 0}`);
    doc.moveDown();

    // List expenses
    doc.fontSize(16).text('Expenses:', { underline: true });
    let totalSpent = 0;
    expenses.forEach(exp => {
      doc.fontSize(12).text(
        `${exp.date.toISOString().slice(0, 10)} | ${exp.category} | ₹${exp.amount} | ${exp.description || ''}`
      );
      totalSpent += exp.amount;
    });

    doc.moveDown();
    doc.fontSize(14).text(`Total Spent: ₹${totalSpent}`);
    const savings = income && budgetPlan ? income.amount - totalSpent : 0;
    doc.text(`Actual Savings: ₹${savings}`);

    doc.end();

    stream.on('finish', () => resolve(outputPath));
    stream.on('error', reject);
  });
}

module.exports = generateMonthlyReport;