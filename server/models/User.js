const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const DEPARTMENTS = ['CSE', 'IT', 'ECE', 'CSE-AI/ML', 'ME'];

// Fields like rollNo/department are only required for students, not the admin
const isStudent = function () {
  return this.role === 'student';
};

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Enter a valid email'],
    },
    rollNo: {
      type: String,
      required: [isStudent, 'Roll number is required'],
      unique: true,
      sparse: true, // allows the admin to have no roll number
      uppercase: true,
      trim: true,
      match: [/^\d{2}B[A-Z]{2}\d{4}$/, 'Roll number must look like 23BCS1042'],
    },
    department: {
      type: String,
      required: [isStudent, 'Department is required'],
      enum: { values: DEPARTMENTS, message: 'Invalid department' },
    },
    year: {
      type: Number,
      required: [isStudent, 'Year is required'],
      min: [1, 'Year must be 1-4'],
      max: [4, 'Year must be 1-4'],
    },
    phone: {
      type: String,
      required: [isStudent, 'Phone number is required'],
      match: [/^[6-9]\d{9}$/, 'Enter a valid 10-digit phone number'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // never returned in queries unless asked for
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student',
    },
  },
  { timestamps: true }
);

// Hash the password before saving (only if it changed)
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare a plain password with the stored hash
userSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Remove password from any JSON response
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
module.exports.DEPARTMENTS = DEPARTMENTS;
