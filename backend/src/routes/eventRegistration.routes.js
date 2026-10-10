const express = require('express');
const router = express.Router();
const eventRegController = require('../controllers/eventRegistration.controller');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, eventRegController.getAllRegistrations);
router.post('/', verifyToken, eventRegController.registerCustomer);
router.put('/attendance', verifyToken, eventRegController.markAttendance);
router.delete('/:id', verifyToken, eventRegController.cancelRegistration);

module.exports = router;
