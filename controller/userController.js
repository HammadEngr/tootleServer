const User = require('../model/userModel');
const authController = require('./authController');

exports.signUp = authController.signUp(User);
exports.logIn = authController.logIn(User);
exports.forgotPassword = authController.forgotPassword(User);
exports.resetPassword = authController.resetPassword(User);
//Protected
exports.protect = authController.protect(User);
exports.updatePassword = authController.updatePassword(User);
exports.updateMe = authController.updateMe(User);
exports.deleteMe = authController.deleteMe(User);
