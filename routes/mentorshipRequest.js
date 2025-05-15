const express = require('express');
const router = express.Router();
const { createNewRequest, updateRequestStatus, deleteRequest, getAllMentorshipRequests} = require('../controllers/mentorshipRequestController');
const { restrictToStudent,authMiddleware } = require('../middlewares/auth');

// routes for Mentorship Requests(students only)
// Route to create a new mentorship request
router.post('/', authMiddleware, restrictToStudent,  createNewRequest);

// Route to get all mentorship requests
router.get('/', authMiddleware, restrictToStudent,  getAllMentorshipRequests);

// Route to update the status of a mentorship request
router.patch('/:requestId', authMiddleware, restrictToStudent, updateRequestStatus);

// Route to delete a mentorship request     
router.delete('/:id', authMiddleware, restrictToStudent,  deleteRequest);