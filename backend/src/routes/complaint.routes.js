const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaint.controller');
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/', verifyToken, complaintController.getAllComplaints);
router.get('/:id', verifyToken, complaintController.getComplaintById);
router.post('/', verifyToken, complaintController.createComplaint);
router.post('/:id/assign', verifyToken, requireRole(['Admin', 'Manager']), complaintController.assignEmployee);
router.post('/:id/resolve', verifyToken, complaintController.resolveComplaint);
router.delete('/:id', verifyToken, requireRole(['Admin']), complaintController.deleteComplaint);

module.exports = router;
