const mongoose = require('mongoose');

const CATEGORIES = [
  'Technical Skills',
  'Communication',
  'Teamwork',
  'Behaviour',
  'Leadership',
  'Punctuality',
];

const feedbackSchema = new mongoose.Schema(
  {
    givenTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Receiver is required'],
    },
    givenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: { values: CATEGORIES, message: 'Invalid category' },
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be 1-5'],
      max: [5, 'Rating must be 1-5'],
    },
    comment: {
      type: String,
      required: [true, 'Comment is required'],
      trim: true,
      minlength: [5, 'Comment must be at least 5 characters'],
      maxlength: [500, 'Comment can be at most 500 characters'],
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Feedback', feedbackSchema);
module.exports.CATEGORIES = CATEGORIES;
