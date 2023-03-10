const mongoose = require('mongoose');
const validator = require('validator');
const factory = require('./modelFactory');

const userSchema = new mongoose.Schema(
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
      default: 'user',
      enum: ['user', 'admin'],
    },
    photo: {
      type: String,
      required: [true, 'upload your photo '],
    },
    slug: String,
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    isActive: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
//Pre Middlewares
userSchema.pre('save', factory.setSlugs());
userSchema.pre('save', factory.setPasswordHash());
userSchema.pre('save', factory.setPasswordChangedAt());

// Document Methods
userSchema.methods.comparePasswords = factory.comparePasswords();
userSchema.methods.createResetToken = factory.createResetToken();
userSchema.methods.changedPasswordAfter = factory.changedPasswordAfter();

const User = mongoose.model('User', userSchema);
module.exports = User;
