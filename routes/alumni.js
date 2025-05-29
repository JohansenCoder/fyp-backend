const express = require('express');
const { updateAlumniProfile,searchAlumni,createConnectionRequest,respondConnectionRequest,getConnections,
        createJobOpportunity,getJobOpportunities,searchMentors,createMentorshipRequest,
        respondMentorshipRequest,sendMessage,getMessages } = require('../controllers/alumniController');
const {authMiddleware,restrictToAdmin, restrictToAlumni, restrictToStudent} = require('../middlewares/auth');
const router = express.Router();

//allow alumni to update their profile
router.put('/profile', authMiddleware, restrictToAlumni, updateAlumniProfile);

//allow users to search for alumni
router.get('/search', authMiddleware, searchAlumni);

// allows alumni to create a connection
router.post('/connections/:id', authMiddleware, restrictToAlumni, createConnectionRequest);

// allows alumni to respond to connection requests
router.put('/connections/:id', authMiddleware, restrictToAlumni, respondConnectionRequest);

// allows alumni to get their connections
router.get('/connections', authMiddleware, restrictToAlumni, getConnections);

// allows admins to create a job opportunity
router.post('/jobs', authMiddleware, restrictToAdmin, createJobOpportunity);

// allows admins to close a job opportunity
router.put('/jobs/:id', authMiddleware, restrictToAdmin, closeJobOpportunity);

// allows alumni to view tye posted job opportunities
router.get('/jobs', authMiddleware, restrictToAlumni, getJobOpportunities);

// allows students to search for mentors
router.get('/mentors/search',authMiddleware, restrictToStudent, searchMentors);

// allows students to create a mentorship request
router.post('/mentors/:id', authMiddleware, restrictToStudent, createMentorshipRequest);

// allows alumni to respond to mentorship requests
router.put('/mentors/:id', authMiddleware, restrictToAlumni, respondMentorshipRequest);

// // allows students and  mentors to message each other
// router.post('/messages/:mentorshipId', authMiddleware, restrictToStudent, restrictToAlumni, sendMessage);

// // allows students and mentors to view messages
// router.get('/messages/:mentorshipId', authMiddleware, restrictToStudent, restrictToAlumni, getMessages);

module.exports = router;