const express = require('express');
const hpp = require('hpp');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const placeRouter = require('./routes/placeRoutes');
const userRouter = require('./routes/userRoutes');
const hostRouter = require('./routes/hostRoutes');
const reviewRouter = require('./routes/reviewsRoutes');

const gloablErrorHandler = require('./controller/errorController');
const AppError = require('./utils/appError');

const app = express();

// set security HTTP headers
app.use(helmet());

// prevent DENIAL OF SERVICE & BRUTE FORCE ATTACKS by limiting request per hour
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, Please try again in an hour',
});
app.use('/api', limiter);

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());
// Data sanitization againts XSS(cross site scripting attacks)
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);
//body parser
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

app.use(
  cors({
    origin: 'http://localhost:3000', // allow requests from this origin
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

app.use('/tootle/v1/places', placeRouter);
app.use('/tootle/v1/hosts', hostRouter);
app.use('/tootle/v1/users', userRouter);
app.use('/tootle/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Route: ${req.originalUrl} not found`, 404));
});

app.use(gloablErrorHandler);

module.exports = app;
