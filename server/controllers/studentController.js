const mongoose = require('mongoose');
const User = require('../models/User');
const Feedback = require('../models/Feedback');
const { asyncHandler, escapeRegex } = require('../utils/helpers');

// Calculates average rating + feedback count for each given student id
const getRatingMap = async (studentIds) => {
  const stats = await Feedback.aggregate([
    { $match: { givenTo: { $in: studentIds } } },
    { $group: { _id: '$givenTo', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const map = {};
  stats.forEach((s) => {
    map[s._id.toString()] = { avgRating: Number(s.avgRating.toFixed(1)), count: s.count };
  });
  return map;
};

// GET /api/students?search=&department=&year=
// Lists all students except the logged-in one (admin is never listed)
const getStudents = asyncHandler(async (req, res) => {
  const { search, department, year } = req.query;

  const filter = { role: 'student', _id: { $ne: req.user._id } };
  if (department) filter.department = department;
  if (year) filter.year = Number(year);
  if (search) {
    const regex = new RegExp(escapeRegex(search.trim()), 'i');
    filter.$or = [{ name: regex }, { rollNo: regex }];
  }

  const students = await User.find(filter).sort({ name: 1 });
  const ratings = await getRatingMap(students.map((s) => s._id));

  const result = students.map((s) => ({
    ...s.toJSON(),
    avgRating: ratings[s._id.toString()]?.avgRating || 0,
    feedbackCount: ratings[s._id.toString()]?.count || 0,
  }));

  res.json({ students: result });
});

// GET /api/students/:id  - one student's profile + rating summary
const getStudentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(404).json({ message: 'Student not found' });
  }

  const student = await User.findOne({ _id: id, role: 'student' });
  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }

  const [summary] = await Feedback.aggregate([
    { $match: { givenTo: student._id } },
    { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  const byCategory = await Feedback.aggregate([
    { $match: { givenTo: student._id } },
    { $group: { _id: '$category', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  // How many notes the logged-in user has already left for this student
  const givenByMe = await Feedback.countDocuments({ givenTo: student._id, givenBy: req.user._id });

  res.json({
    student,
    avgRating: summary ? Number(summary.avgRating.toFixed(1)) : 0,
    feedbackCount: summary ? summary.count : 0,
    byCategory: byCategory.map((c) => ({
      category: c._id,
      avgRating: Number(c.avgRating.toFixed(1)),
      count: c.count,
    })),
    givenByMe,
  });
});

module.exports = { getStudents, getStudentById };
