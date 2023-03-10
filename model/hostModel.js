const mongoose = require('mongoose');
const validator = require('validator');
const factory = require('./modelFactory');

const hostSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please tell us your name'],
    },
    email: {
      type: String,
      required: [true, 'Please tell us your email'],
      unique: [true, 'User with this email already exists'],
      lowercase: true,
      validate: [validator.isEmail, 'Provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Enter your password'],
      minlenth: [8, 'Password must be atleast 8 characters long'],
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        validator: function (val) {
          return val === this.password;
        },
        message: 'Passwords should match',
      },
    },
    role: {
      type: String,
      default: 'host',
      enum: ['admin', 'host'],
    },
    isActive: {
      type: Boolean,
      default: true,
      select: false,
    },
    slug: String,
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetTokenExpires: Date,
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

//Pre Middlewares

hostSchema.pre('save', factory.setSlugs());
hostSchema.pre('save', factory.setPasswordHash());
hostSchema.pre('save', factory.setPasswordChangedAt());

// Document methods
hostSchema.methods.comparePasswords = factory.comparePasswords();
hostSchema.methods.createResetToken = factory.createResetToken();
hostSchema.methods.changedPasswordAfter = factory.changedPasswordAfter();

const Host = mongoose.model('Host', hostSchema);
module.exports = Host;
