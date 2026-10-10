const express = require('express');
const router = express.Router();
const membershipController = require('../controllers/membership.controller');
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/', verifyToken, membershipController.getAllMemberships);
router.put('/:id', verifyToken, membershipController.updateMembership);
router.post('/add-points', verifyToken, membershipController.addPoints);

module.exports = router;
