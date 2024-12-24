const router = require('express').Router();
const ReviewController = require('../controller/ReviewController');
const  verifyToken  = require("../helpers/verify-token");

router.post('/create', verifyToken, ReviewController.createReview); 
router.get('/', ReviewController.getUserReviews); 
router.put('/:id', verifyToken, ReviewController.updateReview);
router.delete('/:id', verifyToken, ReviewController.deleteReview);

module.exports = router;
