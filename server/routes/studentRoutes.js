const express = require('express');
const { getStudents, getStudentById } = require('../controllers/studentController');
const { protect, studentOnly } = require('../middleware/auth');

const router = express.Router();

router.use(protect, studentOnly);

router.get('/', getStudents);
router.get('/:id', getStudentById);

module.exports = router;
