/**
 * Seed script - resets the database to the starting data.
 * Run with:  npm run seed
 * WARNING: it deletes all existing users and feedback first.
 * (The server also auto-seeds by itself when the database is empty.)
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Feedback = require('./models/Feedback');
const { ADMIN, STUDENTS, STUDENT_PASSWORD, insertSeedData } = require('./data/seedData');

const run = async () => {
  try {
    await connectDB();

    console.log('Clearing old data...');
    await Feedback.deleteMany({});
    await User.deleteMany({});

    const result = await insertSeedData();

    console.log('\nSeed complete');
    console.log(`  1 admin, ${result.students} students, ${result.feedback} feedback`);
    console.log('\nLogin details');
    console.log(`  Admin   : ${ADMIN.email} / ${ADMIN.password}`);
    console.log(`  Student : ${STUDENTS[0].email} / ${STUDENT_PASSWORD}`);
    console.log('  (all students use the same password)\n');
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

run();
