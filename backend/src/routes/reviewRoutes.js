const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticate } = require('../middlewares/auth');

router.get('/my-reviews', authenticate, reviewController.getMyReviews);
router.get('/product/:productId', reviewController.getProductReviews);
router.post('/', authenticate, reviewController.createReview);
router.delete('/:id', authenticate, reviewController.deleteReview);

module.exports = router;
