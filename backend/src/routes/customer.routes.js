const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/', verifyToken, customerController.getAllCustomers);
router.get('/summary/overview', verifyToken, customerController.getCustomerSummary);
router.get('/:id', verifyToken, customerController.getCustomerById);
router.post('/', verifyToken, customerController.createCustomer);
router.put('/:id', verifyToken, customerController.updateCustomer);
router.delete('/:id', verifyToken, requireRole(['Admin', 'Manager']), customerController.deleteCustomer);

module.exports = router;
