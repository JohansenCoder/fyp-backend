const express = require('express');
const { updateAlumniProfile,searchAlumni,createConnectionRequest,respondConnectionRequest,getConnections,
        createJobOpportunity,getJobOpportunities,searchMentors,createMentorshipRequest,
        respondMentorshipRequest,sendMessage,getMessages } = require('../controllers/alumniController');
const {authMiddleware,restrictToAdmin, restrictToAlumni, restrictToStudent} = require('../middlewares/auth');

const { authSecurity } = require('../middlewares/authSecurity');

const router = express.Router();

//allow alumni to update their profile
router.put('/profile', authSecurity, authMiddleware, restrictToAlumni, updateAlumniProfile);

//allow users to search for alumni
router.get('/search', authSecurity, authMiddleware, searchAlumni);

// allows alumni to create a connection
router.post('/connections/:id', authSecurity, authMiddleware, restrictToAlumni, createConnectionRequest);

// allows alumni to respond to connection requests
router.put('/connections/:id', authSecurity, authMiddleware, restrictToAlumni, respondConnectionRequest);

// allows alumni to get their connections
router.get('/connections', authSecurity, authMiddleware, restrictToAlumni, getConnections);

// allows admins to create a job opportunity
router.post('/jobs', authSecurity, authMiddleware, restrictToAdmin, createJobOpportunity);

// allows alumni to view tye posted job opportunities
router.get('/jobs', authSecurity, authMiddleware, restrictToAlumni, getJobOpportunities);

// allows students to search for mentors
router.get('/mentors/search', authSecurity,authMiddleware, restrictToStudent, searchMentors);

// allows students to create a mentorship request
router.post('/mentors/:id', authMiddleware, restrictToStudent, createMentorshipRequest);

// allows alumni to respond to mentorship requests
router.put('/mentors/:id', authMiddleware, restrictToAlumni, respondMentorshipRequest);

// allows students and  mentors to message each other
router.post('/messages/:mentorshipId', authSecurity, authMiddleware, restrictToStudent, restrictToAlumni, sendMessage);

// allows students and mentors to view messages
router.get('/messages/:mentorshipId', authSecurity, authMiddleware, restrictToStudent, restrictToAlumni, getMessages);

module.exports = router;