const express = require("express");
const router = express.Router();
const { getAllAlumni, getAlumniById } = require('../controllers/alumniController');

// get all alumni
router.get('/', getAllAlumni)

// get alumni by Id
router.get('/:id',getAlumniById)

module.exports = router;