const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { verifyToken } = require('../middleware/auth');

router.get('/summary', verifyToken, dashboardController.getDashboardSummary);
router.get('/charts', verifyToken, dashboardController.getDashboardCharts);

module.exports = router;
