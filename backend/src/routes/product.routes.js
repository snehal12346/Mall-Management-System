const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/', verifyToken, productController.getAllProducts);
router.get('/alerts/low-stock', verifyToken, productController.getLowStockAlerts);
router.get('/:id', verifyToken, productController.getProductById);
router.post('/', verifyToken, requireRole(['Admin', 'Manager']), productController.createProduct);
router.put('/:id', verifyToken, requireRole(['Admin', 'Manager']), productController.updateProduct);
router.delete('/:id', verifyToken, requireRole(['Admin']), productController.deleteProduct);

module.exports = router;
