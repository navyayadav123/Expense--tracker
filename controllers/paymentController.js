const razorpay = require('../utils/razorpay');
const crypto = require('crypto');


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
// Verify payment signature
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Payment is successful
      // Here you can update your database, mark order as paid, etc.
      return res.status(200).json({
        message: "Payment verified successfully"
      });
    } else {
      return res.status(400).json({
        message: "Invalid signature"
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message
    });
  }
};

// Handle Razorpay webhook events
exports.handleWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const shasum = crypto.createHmac('sha256', webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');

    if (digest === req.headers['x-razorpay-signature']) {
      const event = req.body;
      
      // Handle different webhook events
      switch (event.event) {
        case 'payment.captured':
          // Handle successful payment
          console.log('Payment captured:', event.payload.payment.entity);
          break;
        
        case 'payment.failed':
          // Handle failed payment
          console.log('Payment failed:', event.payload.payment.entity);
          break;
        
        // Add more event handlers as needed
      }

      res.json({ status: 'ok' });
    } else {
      res.status(400).json({ error: 'Invalid webhook signature' });
    }
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};