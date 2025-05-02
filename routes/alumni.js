const express = require("express");
const router = express.Router();
const { getAllAlumni, getAlumniById } = require('../controllers/alumniController');
const { protect, authorize } = require('../middlewares/auth');

// get all alumni
router.get('/', protect, authorize('admin'), getAllAlumni)

// get alumni by Id
router.get('/:id', protect, authorize('admin'), getAlumniById)

module.exports = router;