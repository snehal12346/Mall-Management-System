const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenant.controller');
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/', verifyToken, tenantController.getAllTenants);
router.get('/:id', verifyToken, tenantController.getTenantById);
router.post('/', verifyToken, requireRole(['Admin', 'Manager']), tenantController.createTenant);
router.put('/:id', verifyToken, requireRole(['Admin', 'Manager']), tenantController.updateTenant);
router.delete('/:id', verifyToken, requireRole(['Admin']), tenantController.deleteTenant);

module.exports = router;
