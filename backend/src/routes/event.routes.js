const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/', verifyToken, eventController.getAllEvents);
router.get('/:id', verifyToken, eventController.getEventById);
router.post('/', verifyToken, requireRole(['Admin', 'Manager']), eventController.createEvent);
router.put('/:id', verifyToken, requireRole(['Admin', 'Manager']), eventController.updateEvent);
router.delete('/:id', verifyToken, requireRole(['Admin']), eventController.deleteEvent);

module.exports = router;
