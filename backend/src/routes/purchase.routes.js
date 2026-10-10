const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchase.controller');
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/', verifyToken, purchaseController.getAllPurchases);
router.get('/:id', verifyToken, purchaseController.getPurchaseById);
router.post('/', verifyToken, purchaseController.createPurchase);
router.delete('/:id', verifyToken, requireRole(['Admin']), purchaseController.deletePurchase);

module.exports = router;
