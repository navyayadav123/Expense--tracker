const razorpay = require('../utils/razorpay');

exports.createOrder = async (req, res) => {
try {
const { amount, currency = 'INR', receipt } = req.body;
const options = {
amount: amount * 100, // amount in paise
currency,
receipt,
payment_capture: 1,
};
const order = await razorpay.orders.create(options);
res.json(order);
} catch (err) {
res.status(500).json({ message: 'Error creating order', error: err.message });
}
};