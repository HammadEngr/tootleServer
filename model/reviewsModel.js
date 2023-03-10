const mongoose = require('mongoose');
const Place = require('./placeModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating must be some number'],
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    // Parent ref for place
    place: {
      type: mongoose.Schema.ObjectId,
      ref: 'Place',
      required: [true, 'Review must belong to some place'],
    },
    // Parent ref for user
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: 'place', select: 'name' }).populate({
    path: 'user',
    select: 'name',
  });
  next();
});

// calculating average rating using static method in model
reviewSchema.statics.calcAvgRatings = async function (placeId) {
  const stats = await this.aggregate([
    {
      $match: { place: placeId },
    },
    {
      $group: {
        _id: '$place',
        avgRating: { $avg: '$rating' },
        nRatings: { $sum: 1 },
      },
    },
  ]);
  if (stats.length > 0) {
    await Place.findByIdAndUpdate(placeId, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].nRatings,
    });
  } else {
    await Place.findByIdAndUpdate(placeId, {
      ratingsAverage: 4,
      ratingsQuantity: 0,
    });
  }
};

reviewSchema.post('save', function () {
  this.constructor.calcAvgRatings(this.place);
});

// Updating ratingsAverage on plcae wheneever review is updated or deleted
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.clone().findOne();
  next();
});
reviewSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.calcAvgRatings(this.r.place._id);
});
//
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
