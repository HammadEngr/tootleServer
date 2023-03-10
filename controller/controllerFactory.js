const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    req.body.hostedBy = req.doc.id;
    const newDoc = await Model.create(req.body);
    res.status(200).json({
      status: 'success',
      data: {
        place: newDoc,
      },
    });
  });

exports.getOne = (Model, populateOpt) =>
  catchAsync(async (req, res, next) => {
    let query;
    query = Model.findById(req.params.id);
    if (populateOpt) query = query.populate(populateOpt);
    const doc = await query;
    if (!doc) return next(new AppError('No document found', 404));
    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.placeId) filter.place = req.params.placeId;
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const doc = await features.Model;
    if (!doc) return next(new AppError('No document found', 404));
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        doc,
      },
    });
  });
