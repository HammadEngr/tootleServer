const mongoose = require('mongoose');
const app = require('./app');

const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

// Dealing UNCAUGHT EXCEPTIONS / SYNC CODE ERRORS

process.on('uncaughtException', (err) => {
  console.log('UNHANDLED EXCEPTION 👿 ! SHitting down...');
  console.log(err);
  // this is compulsory here
  process.exit(1);
});

const port = process.env.PORT || 3000;

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DB_PASSWORD);
mongoose.connect(DB).then(() => console.log('😎 DB CONNECTED SUCCESSFULLY'));

app.listen(port, () => {
  console.log(`Listening to ${port}`);
});

// Dealing UNHANDLED REJECTIONS / PROMISES

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION 👿 ! SHitting down...');
  console.log(err);
  // this is optional here
  server.close(() => {
    process.exit(1);
  });
});
