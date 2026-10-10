const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicle.controller');
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/', verifyToken, vehicleController.getAllVehicles);
router.get('/:id', verifyToken, vehicleController.getVehicleById);
router.post('/', verifyToken, vehicleController.createVehicle);
router.put('/:id', verifyToken, vehicleController.updateVehicle);
router.delete('/:id', verifyToken, requireRole(['Admin', 'Manager']), vehicleController.deleteVehicle);

module.exports = router;
