const express = require('express');
const router = express.Router();
const parkingController = require('../controllers/parking.controller');
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/slots', verifyToken, parkingController.getParkingSlots);
router.get('/slots/available-count', verifyToken, parkingController.getAvailableSlotsCount);
router.post('/slots', verifyToken, requireRole(['Admin', 'Manager']), parkingController.createParkingSlot);
router.put('/slots/:id', verifyToken, requireRole(['Admin', 'Manager']), parkingController.updateParkingSlot);
router.delete('/slots/:id', verifyToken, requireRole(['Admin']), parkingController.deleteParkingSlot);

router.get('/entries', verifyToken, parkingController.getParkingEntries);
router.post('/entry', verifyToken, parkingController.createParkingEntry);
router.post('/exit', verifyToken, parkingController.processParkingExit);

module.exports = router;
