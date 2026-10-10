const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenance.controller');
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/', verifyToken, maintenanceController.getAllMaintenance);
router.get('/:id', verifyToken, maintenanceController.getMaintenanceById);
router.post('/', verifyToken, maintenanceController.createMaintenance);
router.post('/:id/assign', verifyToken, requireRole(['Admin', 'Manager']), maintenanceController.assignTechnician);
router.post('/:id/complete', verifyToken, maintenanceController.completeMaintenance);
router.delete('/:id', verifyToken, requireRole(['Admin']), maintenanceController.deleteMaintenance);

module.exports = router;
