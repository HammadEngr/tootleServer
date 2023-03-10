const Place = require('../model/placeModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const factory = require('./controllerFactory');

exports.createPlace = factory.createOne(Place);
exports.getPlace = factory.getOne(Place, { path: 'reviews' });
exports.getAllPlaces = factory.getAll(Place);

exports.updatePlace = catchAsync(async (req, res, next) => {
  const host = req.doc.id.toString();

  const place = await Place.findById(req.params.id);

  if (!place) return next(new AppError('No place found', 404));

  const docHost = place.hostedBy.toString();

  if (!(host === docHost))
    return next(
      new AppError('You are only authorized to update your place', 400)
    );
  const upDatedPlace = await Place.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!place) return next(new AppError('No place found', 404));
  res.status(200).json({
    status: 'success',
    data: {
      upDatedPlace,
    },
  });
});

exports.deletePlace = catchAsync(async (req, res, next) => {
  const host = req.doc.id.toString();

  const place = await Place.findById(req.params.id);

  if (!place) return next(new AppError('No place found', 404));

  const docHost = place.hostedBy.toString();

  if (!(host === docHost))
    return next(
      new AppError('You are only authorized to delete your place', 400)
    );

  await Place.findByIdAndDelete(req.params.id);
  res.status(200).json({
    status: 'success',
    data: null,
  });
});

exports.getStats = catchAsync(async (req, res, next) => {
  const stats = await Place.aggregate([
    {
      $group: {
        _id: '$category',
        avgPrice: { $avg: '$price' },
        maxPrice: { $max: '$price' },
        minPrice: { $min: '$price' },
        avgRating: { $avg: '$ratingsAverage' },
        totalPlaces: { $sum: 1 },
      },
    },
    {
      $sort: {
        avgPrice: 1,
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});
