const express = require('express');
const router = express.Router();
const offerController = require('../controllers/offer.controller');
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/', verifyToken, offerController.getAllOffers);
router.get('/:id', verifyToken, offerController.getOfferById);
router.post('/', verifyToken, requireRole(['Admin', 'Manager']), offerController.createOffer);
router.put('/:id', verifyToken, requireRole(['Admin', 'Manager']), offerController.updateOffer);
router.delete('/:id', verifyToken, requireRole(['Admin']), offerController.deleteOffer);

module.exports = router;
