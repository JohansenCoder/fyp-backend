const express = require('express');
const router = express.Router();
const { createNewRequest, updateRequestStatus, deleteRequest} = require('../controllers/mentorshipRequestController');
const { protect, authorize } = require('../middlewares/auth');

// Route to create a new mentorship request
router.post('/',  createNewRequest);

// Route to update the status of a mentorship request
router.patch('/:requestId', updateRequestStatus);

// Route to delete a mentorship request     
router.delete('/:id',  deleteRequest);