const User = require('../models/User');
const { asyncHandler, generateToken } = require('../utils/helpers');

// POST /api/auth/register  - new students sign up here
const register = asyncHandler(async (req, res) => {
  const { name, email, rollNo, department, year, phone, password } = req.body;

  const existing = await User.findOne({
    $or: [{ email: (email || '').toLowerCase() }, { rollNo: (rollNo || '').toUpperCase() }],
  });
  if (existing) {
    const field = existing.email === (email || '').toLowerCase() ? 'Email' : 'Roll number';
    return res.status(400).json({ message: `${field} is already registered` });
  }

  // role is always "student" - nobody can register as admin
  const user = await User.create({
    name,
    email,
    rollNo,
    department,
    year,
    phone,
    password,
    role: 'student',
  });

  res.status(201).json({ token: generateToken(user._id), user });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Incorrect email or password' });
  }

  res.json({ token: generateToken(user._id), user });
});

// GET /api/auth/me  - returns the logged-in user
const getMe = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

module.exports = { register, login, getMe };
