const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const Place = require('../model/placeModel');
const User = require('../model/userModel');
const Host = require('../model/hostModel');

const places = JSON.parse(fs.readFileSync(`${__dirname}/places.json`, 'utf-8'));
const hosts = JSON.parse(fs.readFileSync(`${__dirname}/hosts.json`, 'utf-8'));
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DB_PASSWORD);
mongoose.connect(DB).then(() => console.log('CONNECTED'));

const uploadData = async () => {
  try {
    await Place.create(places);
    await Host.create(hosts, { validateBeforeSave: false });
    console.log('data uploaded');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await Place.deleteMany();
    await User.deleteMany();
    await Host.deleteMany();

    console.log('data deleted');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  uploadData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
