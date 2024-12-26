const router = require('express').Router();
const ReviewController = require('../controller/ReviewController');
const verifyToken = require("../helpers/verify-token");


router.post('/:bookId', verifyToken, ReviewController.createReview);
router.get('/user', verifyToken, ReviewController.getUserReviews);

router.put('/:id', verifyToken, ReviewController.updateReview);
router.delete('/:id', verifyToken, ReviewController.deleteReview);

router.get('/:bookId', ReviewController.getReviewsByBook);

module.exports = router;
