const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken, requireRole } = require('../middleware/auth');

router.post('/login', authController.login);
router.get('/me', verifyToken, authController.getProfile);
router.post('/register', verifyToken, requireRole(['Admin']), authController.registerUser);

module.exports = router;
