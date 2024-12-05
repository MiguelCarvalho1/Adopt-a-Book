const express = require('express');
const router = express.Router();
const ReviewController = require('../controllers/ReviewController');
const { verifyToken } = require('../helpers/verify-token');

router.post('/', verifyToken, ReviewController.createReview); 
router.get('/:userId', ReviewController.getUserReviews); 
router.put('/:id', verifyToken, ReviewController.updateReview);
router.delete('/:id', verifyToken, ReviewController.deleteReview);

module.exports = router;
