const Host = require('../model/hostModel');

const authController = require('./authController');

exports.signUp = authController.signUp(Host);
exports.logIn = authController.logIn(Host);
exports.forgotPassword = authController.forgotPassword(Host);
exports.resetPassword = authController.resetPassword(Host);
//Protected
exports.protect = authController.protect(Host);
exports.updatePassword = authController.updatePassword(Host);
exports.updateMe = authController.updateMe(Host);
exports.deleteMe = authController.deleteMe(Host);
