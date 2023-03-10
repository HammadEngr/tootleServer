const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const slugify = require('slugify');

// Pre Middlewares
exports.setSlugs = () =>
  function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
  };
exports.setPasswordHash = () =>
  async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    console.log(this.password);
    this.passwordConfirm = undefined;
    next();
  };
exports.setPasswordChangedAt = () =>
  function (next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;

    next();
  };

// Document Methods
exports.comparePasswords = () =>
  async function (candidatePassword, hostPassword) {
    return await bcrypt.compare(candidatePassword, hostPassword);
  };
exports.createResetToken = () =>
  function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
  };
exports.changedPasswordAfter = () =>
  function (JWTtimeStamp) {
    if (this.passwordChangedAt) {
      const changedTimeStamp = parseInt(
        this.passwordChangedAt.getTime() / 1000,
        10
      );
      // it will return either true or false
      return JWTtimeStamp < changedTimeStamp;
    }
    return false;
  };
