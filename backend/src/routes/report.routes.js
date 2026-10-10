const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { verifyToken } = require('../middleware/auth');

router.get('/catalog', verifyToken, reportController.getReportsCatalog);
router.get('/:id', verifyToken, reportController.executeReport);

module.exports = router;
