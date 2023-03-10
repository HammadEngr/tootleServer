const User = require('../model/userModel');
const Host = require('../model/hostModel');
const { promisify } = require('util');
const sendEmail = require('../utils/email');
const crypto = require('crypto');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const jwt = require('jsonwebtoken');

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const sendToken = (res, statusCode, doc) => {
  const token = signToken(doc._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    // sameSite: 'None',
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  res.status(statusCode).json({
    status: 'success',
    token: token,
    data: {
      doc,
    },
  });
};
// Utility fx for filtering object
const filterObj = (body, ...allowedFields) => {
  const newObj = {};
  Object.keys(body).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = body[el];
  });
  return newObj;
};

exports.signUp = (Model) =>
  catchAsync(async (req, res, next) => {
    const newDoc = await Model.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      photo: req.body.photo,
    });
    sendToken(res, 200, newDoc);
  });

exports.logIn = (Model) =>
  catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password)
      return next(new AppError('Please provide email and password'), 400);

    const doc = await Model.findOne({ email: email }).select('+password');

    if (!doc || !(await doc.comparePasswords(password, doc.password)))
      return next(new AppError('wrong credentials'), 401);
    sendToken(res, 200, doc);
  });

exports.forgotPassword = (Model) =>
  catchAsync(async (req, res, next) => {
    const { email } = req.body;

    const doc = await Model.findOne({ email: email });
    if (!doc) return next(new AppError('No doc found with this email'), 400);

    const resetToken = doc.createResetToken();
    await doc.save({ validateBeforeSave: false });

    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )}/tootle/v1/hosts/resetPassword/${resetToken}`;
    const message = `forgot your passwadr? click this link(valid for 10 minutes): ${resetUrl} to request a new one, else ignore this`;

    try {
      await sendEmail({
        email: doc.email,
        subject: 'Password reset token, valid for 10 minutes',
        message,
      });
      res.status(200).json({
        status: 'success',
        message: 'Token sent to email',
      });
    } catch (err) {
      doc.passwordResetToken = undefined;
      doc.passwordResetTokenExpires = undefined;

      await doc.save({ validateBeforeSave: false });

      return next(
        new AppError('There was an error sending email, try again later', 500)
      );
    }
  });

exports.resetPassword = (Model) =>
  catchAsync(async (req, res, next) => {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');

    const doc = await Model.findOne({
      passwordResetToken: hashedToken,
      passwordResetTokenExpires: { $gt: Date.now() },
    });

    if (!doc) return next(new AppError('Token is invalid or expired', 400));

    doc.password = req.body.password;
    doc.passwordConfirm = req.body.passwordConfirm;
    doc.passwordResetToken = undefined;
    doc.passwordResetTokenExpires = undefined;
    await doc.save();
    sendToken(res, 200, doc);
  });

exports.protect = (Model) =>
  catchAsync(async (req, res, next) => {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return next(new AppError('Please login to proceed', 401));
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const doc = await Model.findById(decoded.id);
    if (!doc)
      return next(
        new AppError('User belonging to this token no longer exist'),
        400
      );

    if (doc.changedPasswordAfter(decoded.iat))
      return next(new AppError('You recentlt changed your password', 400));
    req.doc = doc;
    next();
  });

exports.updatePassword = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findOne(req.user.id).select('+password');
    if (!(await doc.comparePasswords(req.body.currentPassword, doc.password)))
      return next(new AppError('Your current password is wrong', 400));
    doc.password = req.body.password;
    doc.passwordConfirm = req.body.passwordConfirm;
    await doc.save();
    sendToken(res, 200, doc);
  });

exports.restrictTo = (...el) =>
  catchAsync(async (req, res, next) => {
    if (!el.includes(req.doc.role))
      return next(
        new AppError('you are not authorized to perform this action', 403)
      );
    next();
  });

exports.updateMe = (Model) =>
  catchAsync(async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm) {
      return next(
        new AppError(
          'wrong request, use reset password to update password',
          400
        )
      );
    }
    const filteredBody = filterObj(req.body, 'name', 'email');
    const updatedDoc = await Model.findByIdAndUpdate(req.doc.id, filteredBody, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      body: {
        doc: updatedDoc,
      },
    });
  });

exports.deleteMe = (Model) =>
  catchAsync(async (req, res, next) => {
    await Model.findByIdAndUpdate(req.doc.id, { isActive: false });
    res.status(200).json({
      status: 'success',
      data: null,
    });
  });
