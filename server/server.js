require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { seedIfEmpty } = require('./data/seedData');

const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// ---------- CORS ----------
// CLIENT_URL can hold several URLs separated by commas
const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((url) => url.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : true,
  })
);
app.use(express.json());

// ---------- Routes ----------
app.get('/', (req, res) => res.json({ message: 'BatchNotes API is running' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin', adminRoutes);

// ---------- 404 ----------
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
});

// ---------- Error handler ----------
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // Mongoose validation error -> show the first message
  if (err.name === 'ValidationError') {
    const first = Object.values(err.errors)[0];
    return res.status(400).json({ message: first.message });
  }
  // Duplicate unique field (email / rollNo)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'Field';
    const label = field === 'rollNo' ? 'Roll number' : field.charAt(0).toUpperCase() + field.slice(1);
    return res.status(400).json({ message: `${label} is already registered` });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid value provided' });
  }

  console.error(err);
  res.status(500).json({ message: 'Something went wrong on the server' });
});

// ---------- Start ----------
const PORT = process.env.PORT || 5000;

connectDB()
  .then(seedIfEmpty)
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
