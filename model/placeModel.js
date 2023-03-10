const mongoose = require('mongoose');
const factory = require('./modelFactory');

const placeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Place must have a name'],
      minlength: 6,
      unique: true,
    },
    slug: String,
    category: {
      type: String,
      required: [true, 'Please mention category'],
      enum: ['house', 'apartment', 'hotel', 'guesthouse'],
      message: 'Category can be house, apartment, hotel or guesthouse',
    },
    price: {
      type: Number,
      required: [true, 'Place must have price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'Price discount can not exceed actual price',
      },
    },
    maxGuest: {
      type: Number,
      required: [true, 'Please mention maximum guests capacity '],
      min: 1,
    },
    bedRooms: {
      type: Number,
      required: [true, 'Mention number of bedrooms'],
      min: [1, 'At least one bedroom is required'],
    },
    bathRooms: {
      type: Number,
      default: 1,
    },
    summary: {
      type: String,
      required: [true, 'Please write the summary for this place'],
      max: [60, 'summary can not exceed 60 words'],
      min: [20, 'summary must have 20 words atleast'],
    },
    description: {
      type: String,
      min: [20, 'description can have minimum 20 words'],
      max: [150, 'description can have maximum 150 words'],
    },
    ratingsAverage: {
      type: Number,
      default: 4,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    imageCover: {
      type: String,
      required: [true, 'place shoudl have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    hostedBy: [
      // child reference
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Host',
        required: [true, 'place must have a host id'],
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
//Virtual Populate
placeSchema.pre('save', factory.setSlugs());
placeSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'place',
  localField: '_id',
});

const Place = mongoose.model('Place', placeSchema);

module.exports = Place;
