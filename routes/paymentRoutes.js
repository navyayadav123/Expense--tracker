const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/create-order', paymentController.createOrder);

router.post('/verify', authMiddleware, paymentController.verifyPayment);

// Webhook handler (public route - needs to be accessible by Razorpay)
router.post('/webhook', paymentController.handleWebhook);

module.exports = router;