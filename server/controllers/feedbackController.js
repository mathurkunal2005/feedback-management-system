const mongoose = require('mongoose');
const Feedback = require('../models/Feedback');
const User = require('../models/User');
const { asyncHandler } = require('../utils/helpers');

// POST /api/feedback  - a student gives feedback to another student
const createFeedback = asyncHandler(async (req, res) => {
  const { givenTo, category, rating, comment, isAnonymous } = req.body;

  if (!givenTo || !mongoose.isValidObjectId(givenTo)) {
    return res.status(400).json({ message: 'Choose a student to give feedback to' });
  }

  // Block self-feedback
  if (givenTo === req.user._id.toString()) {
    return res.status(400).json({ message: "You can't give feedback to yourself" });
  }

  const receiver = await User.findOne({ _id: givenTo, role: 'student' });
  if (!receiver) {
    return res.status(404).json({ message: 'Student not found' });
  }

  const feedback = await Feedback.create({
    givenTo,
    givenBy: req.user._id,
    category,
    rating,
    comment,
    isAnonymous: Boolean(isAnonymous),
  });

  res.status(201).json({ message: 'Feedback sent', feedback });
});

// GET /api/feedback/received  - feedback about the logged-in student
// Anonymous feedback hides who wrote it
const getReceived = asyncHandler(async (req, res) => {
  const list = await Feedback.find({ givenTo: req.user._id })
    .populate('givenBy', 'name rollNo department year')
    .sort({ createdAt: -1 });

  const feedback = list.map((f) => {
    const obj = f.toObject();
    if (obj.isAnonymous) obj.givenBy = null;
    return obj;
  });

  res.json({ feedback });
});

// GET /api/feedback/given  - feedback the logged-in student wrote
const getGiven = asyncHandler(async (req, res) => {
  const feedback = await Feedback.find({ givenBy: req.user._id })
    .populate('givenTo', 'name rollNo department year')
    .sort({ createdAt: -1 });

  res.json({ feedback });
});

module.exports = { createFeedback, getReceived, getGiven };
