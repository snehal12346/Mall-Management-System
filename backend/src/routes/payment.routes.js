const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, paymentController.getAllPayments);
router.post('/', verifyToken, paymentController.createPayment);
router.get('/stats/summary', verifyToken, paymentController.getPaymentStats);

module.exports = router;
