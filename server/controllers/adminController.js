const mongoose = require('mongoose');
const Feedback = require('../models/Feedback');
const User = require('../models/User');
const { asyncHandler, escapeRegex } = require('../utils/helpers');

const STUDENT_FIELDS = 'name rollNo department year email';

// GET /api/admin/feedback?search=&category=&rating=
// Admin sees everything, including who wrote anonymous feedback
const getAllFeedback = asyncHandler(async (req, res) => {
  const { search, category, rating } = req.query;
  const filter = {};

  if (category) filter.category = category;
  if (rating) filter.rating = Number(rating);

  if (search) {
    const regex = new RegExp(escapeRegex(search.trim()), 'i');
    const matches = await User.find({ $or: [{ name: regex }, { rollNo: regex }] }).select('_id');
    const ids = matches.map((u) => u._id);
    filter.$or = [{ givenTo: { $in: ids } }, { givenBy: { $in: ids } }];
  }

  const feedback = await Feedback.find(filter)
    .populate('givenTo', STUDENT_FIELDS)
    .populate('givenBy', STUDENT_FIELDS)
    .sort({ createdAt: -1 });

  res.json({ feedback });
});

// PUT /api/admin/feedback/:id  - edit category / rating / comment / anonymous
const updateFeedback = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(404).json({ message: 'Feedback not found' });
  }

  const feedback = await Feedback.findById(id);
  if (!feedback) {
    return res.status(404).json({ message: 'Feedback not found' });
  }

  const { category, rating, comment, isAnonymous } = req.body;
  if (category !== undefined) feedback.category = category;
  if (rating !== undefined) feedback.rating = rating;
  if (comment !== undefined) feedback.comment = comment;
  if (isAnonymous !== undefined) feedback.isAnonymous = Boolean(isAnonymous);

  await feedback.save(); // runs schema validation
  await feedback.populate([
    { path: 'givenTo', select: STUDENT_FIELDS },
    { path: 'givenBy', select: STUDENT_FIELDS },
  ]);

  res.json({ message: 'Feedback updated', feedback });
});

// DELETE /api/admin/feedback/:id
const deleteFeedback = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(404).json({ message: 'Feedback not found' });
  }

  const feedback = await Feedback.findByIdAndDelete(id);
  if (!feedback) {
    return res.status(404).json({ message: 'Feedback not found' });
  }

  res.json({ message: 'Feedback deleted' });
});

// GET /api/admin/students  - all students with how much feedback they got/gave
const getAllStudents = asyncHandler(async (req, res) => {
  const students = await User.find({ role: 'student' }).sort({ createdAt: -1 });

  const [received, given] = await Promise.all([
    Feedback.aggregate([{ $group: { _id: '$givenTo', count: { $sum: 1 }, avg: { $avg: '$rating' } } }]),
    Feedback.aggregate([{ $group: { _id: '$givenBy', count: { $sum: 1 } } }]),
  ]);

  const receivedMap = Object.fromEntries(received.map((r) => [r._id.toString(), r]));
  const givenMap = Object.fromEntries(given.map((g) => [g._id.toString(), g.count]));

  res.json({
    students: students.map((s) => {
      const r = receivedMap[s._id.toString()];
      return {
        ...s.toJSON(),
        receivedCount: r ? r.count : 0,
        avgRating: r ? Number(r.avg.toFixed(1)) : 0,
        givenCount: givenMap[s._id.toString()] || 0,
      };
    }),
  });
});

// DELETE /api/admin/students/:id  - removes the student and all their feedback
const deleteStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(404).json({ message: 'Student not found' });
  }

  const student = await User.findOne({ _id: id, role: 'student' });
  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }

  const { deletedCount } = await Feedback.deleteMany({
    $or: [{ givenTo: student._id }, { givenBy: student._id }],
  });
  await student.deleteOne();

  res.json({ message: `Student deleted along with ${deletedCount} feedback` });
});

// GET /api/admin/stats  - numbers for the dashboard
const getStats = asyncHandler(async (req, res) => {
  const [totalStudents, totalFeedback, avgAgg, topStudents, byCategory, anonymousCount] =
    await Promise.all([
      User.countDocuments({ role: 'student' }),
      Feedback.countDocuments(),
      Feedback.aggregate([{ $group: { _id: null, avg: { $avg: '$rating' } } }]),
      Feedback.aggregate([
        { $group: { _id: '$givenTo', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
        { $match: { count: { $gte: 2 } } }, // need at least 2 notes to rank
        { $sort: { avgRating: -1, count: -1 } },
        { $limit: 3 },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'student' } },
        { $unwind: '$student' },
        {
          $project: {
            _id: 0,
            id: '$student._id',
            name: '$student.name',
            rollNo: '$student.rollNo',
            department: '$student.department',
            avgRating: { $round: ['$avgRating', 1] },
            count: 1,
          },
        },
      ]),
      Feedback.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Feedback.countDocuments({ isAnonymous: true }),
    ]);

  res.json({
    totalStudents,
    totalFeedback,
    avgRating: avgAgg[0] ? Number(avgAgg[0].avg.toFixed(1)) : 0,
    anonymousCount,
    topStudents,
    byCategory: byCategory.map((c) => ({ category: c._id, count: c.count })),
  });
});

module.exports = {
  getAllFeedback,
  updateFeedback,
  deleteFeedback,
  getAllStudents,
  deleteStudent,
  getStats,
};
