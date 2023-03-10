const AppError = require('../utils/appError');

// Development Errors Handler
const sendErrorDev = (error, response) => {
  response.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    error: error,
    stack: error.stack,
  });
};

// Production Errors Handler
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors)
    .map((el) => el.message)
    .join('. ');
  return new AppError(`Invalid input: ${errors}`, 404);
};

const handleDupliacteFieldsDb = (err) => {
  let value;
  for (let key in err.keyValue) {
    value = err.keyValue[key];
  }
  return new AppError(`Duplicate field: ${value}, try another one`, 400);
};

const handleCastErrorDb = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleJWTError = () => new AppError('Inavlid token', 401);

const handleJWTExpiredError = () =>
  new AppError('Token Expired, please login again', 401);
// Send Errors To Production
const sendErrorProd = (error, response) => {
  console.log(error);
  if (error.isOperational) {
    response.status(error.statusCode).json({
      status: error.status,
      error: error.message,
    });
    return;
  }
  response.status(500).json({
    status: 'error',
    error: 'Something went wrong',
  });
};

// Global Errors Handler
const gloablErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'something went wrong';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err, message: err.message };
    if (err.name === 'ValidationError') {
      error = handleValidationErrorDB(error);
    }
    if (error.code === 11000) error = handleDupliacteFieldsDb(error);
    if (error.name === 'CastError') error = handleCastErrorDb(error);
    if (error.name === 'JasonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    sendErrorProd(error, res);
  }
};

module.exports = gloablErrorHandler;
