const User = require('../models/User');
const Feedback = require('../models/Feedback');

const ADMIN = {
  name: 'Admin',
  email: 'admin@college.edu',
  password: 'admin123',
  role: 'admin',
};

const STUDENT_PASSWORD = 'student123';

const STUDENTS = [
  { name: 'Aarav Sharma', email: 'aarav.sharma@student.college.edu', rollNo: '23BCS1042', department: 'CSE', year: 3, phone: '9829145620' },
  { name: 'Priya Agarwal', email: 'priya.agarwal@student.college.edu', rollNo: '23BCS1087', department: 'CSE', year: 3, phone: '9414237781' },
  { name: 'Rohan Meena', email: 'rohan.meena@student.college.edu', rollNo: '22BIT2015', department: 'IT', year: 4, phone: '8302456193' },
  { name: 'Sneha Choudhary', email: 'sneha.choudhary@student.college.edu', rollNo: '24BCS1123', department: 'CSE', year: 2, phone: '7976341285' },
  { name: 'Vikram Singh Rathore', email: 'vikram.rathore@student.college.edu', rollNo: '22BEC3034', department: 'ECE', year: 4, phone: '9571823406' },
  { name: 'Ananya Jain', email: 'ananya.jain@student.college.edu', rollNo: '23BAI1056', department: 'CSE-AI/ML', year: 3, phone: '9887012354' },
  { name: 'Harsh Gupta', email: 'harsh.gupta@student.college.edu', rollNo: '24BIT2078', department: 'IT', year: 2, phone: '8058934127' },
  { name: 'Ishita Khandelwal', email: 'ishita.khandelwal@student.college.edu', rollNo: '23BCS1099', department: 'CSE', year: 3, phone: '9636478210' },
  { name: 'Kartik Yadav', email: 'kartik.yadav@student.college.edu', rollNo: '22BCS1011', department: 'CSE', year: 4, phone: '7340291568' },
  { name: 'Meera Pareek', email: 'meera.pareek@student.college.edu', rollNo: '24BAI1034', department: 'CSE-AI/ML', year: 2, phone: '9024567831' },
];

// [fromIndex, toIndex, category, rating, comment, isAnonymous, daysAgo]
const FEEDBACK = [
  [0, 2, 'Technical Skills', 5, 'Rohan helped our whole team debug the DBMS project. Really solid with SQL joins and normalization.', false, 2],
  [1, 0, 'Communication', 4, 'Explained our mini project clearly during the review. Could slow down a bit while presenting though.', false, 3],
  [3, 1, 'Leadership', 5, 'Priya organised the entire tech fest volunteer team without any chaos. Everyone knew their task.', false, 4],
  [2, 3, 'Teamwork', 4, 'Very cooperative in the IoT lab group. Always ready to take up the boring documentation part too.', false, 5],
  [4, 8, 'Technical Skills', 5, 'Kartik is the go-to person for DSA doubts. Explained segment trees to me in 10 minutes.', false, 6],
  [5, 7, 'Behaviour', 5, 'Ishita is kind to everyone, helped juniors with their first hackathon registration.', false, 7],
  [6, 4, 'Punctuality', 2, 'Good ideas, but often misses group meeting deadlines and replies late on the group chat.', true, 8],
  [7, 5, 'Technical Skills', 5, 'Ananya built the ML model for our project almost single-handedly. Knows her pandas and sklearn well.', false, 9],
  [8, 6, 'Communication', 3, 'Harsh knows the concepts but hesitates to speak up in group discussions. Should share ideas more.', false, 10],
  [9, 0, 'Teamwork', 5, 'Aarav split the work fairly in our web dev project and kept checking if anyone was stuck.', false, 11],
  [0, 8, 'Leadership', 4, 'Kartik led the coding club sessions really well this semester. Sessions sometimes ran too long.', false, 12],
  [1, 5, 'Punctuality', 5, 'Never missed a single project meeting. Always submits her part before the deadline.', false, 14],
  [2, 7, 'Communication', 4, 'Good at explaining things in simple words. Her viva prep notes helped half the class.', false, 15],
  [3, 9, 'Behaviour', 4, 'Meera is friendly and approachable, made the new batch feel welcome during orientation.', false, 16],
  [4, 2, 'Leadership', 3, 'Rohan takes charge, which is good, but sometimes does not listen to others before deciding.', true, 18],
  [5, 1, 'Technical Skills', 4, 'Priya is strong in OS and Computer Networks. Her subnetting tricks are really useful.', false, 19],
  [6, 9, 'Teamwork', 4, 'Easy to work with in the Python lab. Shares code and helps fix errors without making you feel dumb.', false, 21],
  [7, 3, 'Punctuality', 3, 'Sneha is a hard worker but comes late to most morning labs. Mostly the 9 AM ones.', true, 22],
  [8, 0, 'Technical Skills', 4, 'Aarav is good with React and Node. Needs to get stronger in DSA for placements.', false, 24],
  [9, 6, 'Behaviour', 5, 'Harsh is always polite and patient. Helped me set up Git when I was totally lost.', false, 25],
  [0, 4, 'Teamwork', 4, 'Vikram handled the entire hardware part of our robotics project. Reliable when it matters.', false, 27],
  [1, 7, 'Leadership', 5, 'Ishita was a great class representative. Raised our timetable issue with the HOD properly.', false, 30],
  [2, 6, 'Technical Skills', 3, 'Harsh has improved a lot since first year. Still needs practice with recursion problems.', false, 33],
  [5, 8, 'Communication', 2, 'Very skilled but can come off as rude when explaining. A little patience would go a long way.', true, 36],
  [3, 0, 'Punctuality', 4, 'Aarav is mostly on time for labs and submissions. Missed one deadline but informed the team early.', false, 40],
];

// Inserts the admin, students and feedback. Assumes the collections are empty.
const insertSeedData = async () => {

  console.log('Creating admin...');
  await User.create(ADMIN);

  console.log('Creating students...');
  // User.create runs the pre-save hook so passwords get hashed
  const students = await User.create(
    STUDENTS.map((s) => ({ ...s, password: STUDENT_PASSWORD, role: 'student' }))
  );

  console.log('Creating feedback...');
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;
  const docs = FEEDBACK.map(([from, to, category, rating, comment, isAnonymous, daysAgo]) => {
    // spread the times within the day so the list doesn't look robotic
    const date = new Date(now - daysAgo * DAY - ((from * 37 + to * 11) % 600) * 60 * 1000);
    return {
      givenBy: students[from]._id,
      givenTo: students[to]._id,
      category,
      rating,
      comment,
      isAnonymous,
      createdAt: date,
      updatedAt: date,
    };
  });
  // Insert directly so our custom past dates are kept
  await Feedback.collection.insertMany(docs);

  return { students: students.length, feedback: docs.length };
};

// Used by server.js: seeds only when the database has no users yet
const seedIfEmpty = async () => {
  const count = await User.estimatedDocumentCount();
  if (count > 0) return false;
  console.log('Empty database detected, loading starting data...');
  const result = await insertSeedData();
  console.log(`Loaded ${result.students} students and ${result.feedback} feedback`);
  return true;
};

module.exports = { ADMIN, STUDENTS, STUDENT_PASSWORD, insertSeedData, seedIfEmpty };
