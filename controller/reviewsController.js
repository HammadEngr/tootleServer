const Review = require('../model/reviewsModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const factory = require('./controllerFactory');

exports.setPlaceUserId = (req, res, next) => {
  if (!req.body.plcae) req.body.place = req.params.placeId;
  if (!req.body.user) req.body.user = req.doc.id;
  next();
};

exports.createReview = factory.createOne(Review);
exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);

exports.updateReview = catchAsync(async (req, res, next) => {
  //   const host = req.doc.id.toString();

  //   const place = await Place.findById(req.params.id);

  //   if (!place) return next(new AppError('No place found', 404));

  //   const docHost = place.hostedBy.toString();

  //   if (!(host === docHost))
  //     return next(
  //       new AppError('You are only authorized to update your place', 400)
  //     );
  const upDatedReview = await Review.findByIdAndUpdate(req.params.id, req.body);
  if (!upDatedReview) return next(new AppError('No place found', 404));
  res.status(200).json({
    status: 'success',
    data: {
      upDatedReview,
    },
  });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  //   const host = req.doc.id.toString();

  //   const place = await Place.findById(req.params.id);

  //   if (!place) return next(new AppError('No place found', 404));

  //   const docHost = place.hostedBy.toString();

  //   if (!(host === docHost))
  //     return next(
  //       new AppError('You are only authorized to delete your place', 400)
  //     );

  await Review.findByIdAndDelete(req.params.id);
  res.status(200).json({
    status: 'success',
    data: null,
  });
});
