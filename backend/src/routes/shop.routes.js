const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shop.controller');
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/', verifyToken, shopController.getAllShops);
router.get('/summary/sales', verifyToken, shopController.getShopSalesSummary);
router.get('/:id', verifyToken, shopController.getShopById);
router.post('/', verifyToken, requireRole(['Admin', 'Manager']), shopController.createShop);
router.put('/:id', verifyToken, requireRole(['Admin', 'Manager']), shopController.updateShop);
router.delete('/:id', verifyToken, requireRole(['Admin']), shopController.deleteShop);

module.exports = router;
