const express = require('express');

const router = express.Router();
const hostController = require('../controller/hostController');

router.route('/signUp').post(hostController.signUp);
router.route('/logIn').post(hostController.logIn);
router.route('/forgotPassword').post(hostController.forgotPassword);
router.route('/resetPassword/:resetToken').post(hostController.resetPassword);
// Protected Routes
router
  .route('/updatePassword')
  .patch(hostController.protect, hostController.updatePassword);
router
  .route('/updateMe')
  .patch(hostController.protect, hostController.updateMe);
router
  .route('/deleteMe')
  .delete(hostController.protect, hostController.deleteMe);

module.exports = router;
