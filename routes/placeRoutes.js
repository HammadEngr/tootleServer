const express = require('express');
const placeController = require('../controller/placeController');
const hostController = require('../controller/hostController');
const authController = require('../controller/authController');
const reviewRouter = require('./reviewsRoutes');

const router = express.Router();

router.use('/:placeId/reviews', reviewRouter);

router.route('/getStats').get(placeController.getStats);

router
  .route('/')
  .get(placeController.getAllPlaces)
  .post(
    hostController.protect,
    authController.restrictTo('host'),
    placeController.createPlace
  );

router
  .route('/:id')
  .get(placeController.getPlace)
  .patch(
    hostController.protect,
    authController.restrictTo('host'),
    placeController.updatePlace
  )
  .delete(
    hostController.protect,
    authController.restrictTo('host'),
    placeController.deletePlace
  );
module.exports = router;
