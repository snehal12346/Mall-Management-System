const express = require('express');
const router = express.Router();
const leaseController = require('../controllers/lease.controller');
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/', verifyToken, leaseController.getAllLeases);
router.get('/:id', verifyToken, leaseController.getLeaseById);
router.post('/', verifyToken, requireRole(['Admin', 'Manager']), leaseController.createLease);
router.put('/:id', verifyToken, requireRole(['Admin', 'Manager']), leaseController.updateLease);
router.delete('/:id', verifyToken, requireRole(['Admin']), leaseController.deleteLease);

module.exports = router;
