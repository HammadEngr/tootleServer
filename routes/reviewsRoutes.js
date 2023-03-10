const express = require('express');
const reviewController = require('../controller/reviewsController');
const authController = require('../controller/authController');
const userController = require('../controller/userController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .post(
    userController.protect,
    authController.restrictTo('user'),
    reviewController.setPlaceUserId,
    reviewController.createReview
  )
  .get(reviewController.getAllReviews);

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    userController.protect,
    authController.restrictTo('user'),
    reviewController.updateReview
  )
  .delete(
    userController.protect,
    authController.restrictTo('user'),
    reviewController.deleteReview
  );

module.exports = router;
