const express = require('express');
const userController = require('../controller/userController');
const router = express.Router();

router.route('/signUp').post(userController.signUp);
router.route('/logIn').post(userController.logIn);
router.route('/forgotPassword').post(userController.forgotPassword);
router.route('/resetPassword/:resetToken').post(userController.resetPassword);
// Protected
router
  .route('/updatePassword')
  .patch(userController.protect, userController.updatePassword);
router
  .route('/updateMe')
  .patch(userController.protect, userController.updateMe);
router
  .route('/deleteMe')
  .delete(userController.protect, userController.deleteMe);

module.exports = router;
