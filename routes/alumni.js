const express = require('express');
const { updateAlumniProfile,searchAlumni,createConnectionRequest,respondConnectionRequest,getConnections,
        createJobOpportunity,getJobOpportunities,searchMentors,createMentorshipRequest,
        respondMentorshipRequest, closeJobOpportunity , updateJobOpportunity} = require('../controllers/alumniController');
const {authMiddleware,restrictToAdmin, restrictToAlumni, restrictToStudent} = require('../middlewares/auth');
const router = express.Router();
const validate = require('../middlewares/validate');
const { body } = require('express-validator');

//allow alumni to update their profile
router.put('/profile', 
    validate([
        body('profile.graduationYear').optional().isInt({ min: 1960, max: new Date().getFullYear() }),
        body('profile.industry').optional().trim(),
        body('profile.expertise').optional().isArray(),
        body('profile.company').optional().trim(),
        body('profile.jobTitle').optional().trim(),
        body('profile.mentorshipAvailability').optional().isBoolean(),
        body('profile.bio').optional().trim(),
        body('profile.linkedIn').optional().isURL(),
    ]),
    authMiddleware, restrictToAlumni, updateAlumniProfile);

//allow users to search for alumni
router.get('/search', authMiddleware, searchAlumni);

// allows alumni to create a connection
router.post('/connections/:id', authMiddleware, restrictToAlumni, createConnectionRequest);

// allows alumni to respond to connection requests
router.put('/connections/:id', authMiddleware, restrictToAlumni, respondConnectionRequest);

// allows alumni to get their connections
router.get('/connections', authMiddleware, restrictToAlumni, getConnections);

// allows admins to create a job opportunity
router.post('/jobs',
    validate([
        body('title').notEmpty().trim(),
        body('description').notEmpty().trim(),
        body('college').optional().trim(),
        body('department').optional().trim(),
        body('tags').optional().isArray(),
        body('applicationLink').optional().trim().isURL(),
        body('deadline').optional().isISO8601()
    ]),
     authMiddleware, restrictToAdmin, createJobOpportunity);

// allows admin to update a job Opportunity
router.put('/jobs/:id', updateJobOpportunity);
// allows admins to close a job opportunity
router.put('/jobs/:id', authMiddleware, restrictToAdmin, closeJobOpportunity);

// allows alumni & admin to view tye posted job opportunities
router.get('/jobs', authMiddleware, getJobOpportunities);

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