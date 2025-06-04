const { body, param, query } = require('express-validator');
const User = require('../models/UserSchema');
const JobOpportunity = require('../models/JobOpportunitySchema');
const Connection = require('../models/ConnectionSchema');
const Mentorship = require('../models/MentorshipRequestSchema');
const Message = require('../models/MessageSchema');
const { notifyJobOpportunity, notifyMentorshipRequest, notifyMentorshipStatus, notifyAdminAction } = require('../services/notificationService');
const winston = require('winston');
const {validate} = require('../middlewares/validate');
const StudentEngagementTracker = require('../utils/studentEngagement');
const { logAdminAction } = require('../utils/auditLog');

const logger = winston.createLogger({
    transports: [new winston.transports.Console()],
});

// This function updates the alumni profile with the provided data
exports.updateAlumniProfile = 
    async (req, res) => {
        // validating the request body
    validate([
        body('profile.graduationYear').optional().isInt({ min: 1960, max: new Date().getFullYear() }),
        body('profile.industry').optional().trim(),
        body('profile.expertise').optional().isArray(),
        body('profile.company').optional().trim(),
        body('profile.jobTitle').optional().trim(),
        body('profile.mentorshipAvailability').optional().isBoolean(),
        body('profile.bio').optional().trim(),
        body('profile.linkedIn').optional().isURL(),
    ])
        try {
            const user = await User.findById(req.params.id);

            if(!user) return res.status(404).json({ message: "User Not Found"});
            if (user.role !== 'alumni') return res.status(403).json({ message: 'Not an alumni' });

            Object.assign(user.profile, req.body.profile);
            await user.save();
            res.json(user.profile);
        } catch (error) {
            logger.error(`Update alumni profile error: ${error.message}`);
            res.status(500).json({ message: 'Failed to update profile' });
        }
    }
;

// This function helps search for alumni based on various criteria
// It allows searching by college, department, graduation year, industry, and expertise
exports.searchAlumni = [
    query('college').optional().trim(),
    query('department').optional().trim(),
    query('graduationYear').optional().isInt({ min: 1960, max: new Date().getFullYear() }),
    query('industry').optional().trim(),
    query('expertise').optional().trim(),
    async (req, res) => {
        try {
            const { college, department, graduationYear, industry, expertise } = req.query;
            const query = { role: 'alumni' };

            if (college) query.college = college;
            if (department) query['profile.department'] = department;
            if (graduationYear) query['profile.graduationYear'] = Number(graduationYear);
            if (industry) query['profile.industry'] = industry;
            if (expertise) query['profile.expertise'] = expertise;

            const alumni = await User.find(query).select('profile username');
            res.json(alumni);
        } catch (error) {
            logger.error(`Search alumni error: ${error.message}`);
            res.status(500).json({ message: 'Failed to search alumni' });
        }
    },
];

// This function creates a connection request
// It checks if the recipient is an alumni and if a connection already exists
exports.createConnectionRequest = [
    param('id').isMongoId(),
    async (req, res) => {
        try {
            if (req.user.id === req.params.id) {
                return res.status(400).json({ message: 'Cannot connect with yourself' });
            }

            const recipient = await User.findById(req.params.id);
            if (!recipient || recipient.role !== 'alumni') {
                return res.status(404).json({ message: 'Alumni not found' });
            }

            const existingConnection = await Connection.findOne({
                $or: [
                    { requester: req.user.id, recipient: req.params.id },
                    { requester: req.params.id, recipient: req.user.id }
                ]
            });
            if (existingConnection) {
                return res.status(400).json({ message: 'Connection already exists' });
            }

            const connection = new Connection({
                requester: req.user.id,
                recipient: req.params.id,
                status: 'pending'
            });
            await connection.save();
            res.status(201).json(connection);
        } catch (error) {
            logger.error(`Create connection error: ${error.message}`);
            res.status(500).json({ message: 'Failed to create connection' });
        }
    },
];

// This function allows the alumni to respond to a connection request
// It checks if the connection request exists and if the user is authorized to respond
exports.respondConnectionRequest = [
    param('id').isMongoId(),
    body('status').isIn(['accepted', 'rejected']),
    async (req, res) => {
        try {
            const connection = await Connection.findById(req.params.id);
            if (!connection) return res.status(404).json({ message: 'Connection not found' });
            if (connection.recipient.toString() !== req.user.id) {
                return res.status(403).json({ message: 'Unauthorized' });
            }
            if (connection.status !== 'pending') {
                return res.status(400).json({ message: 'Connection already responded' });
            }            connection.status = req.body.status;
            await connection.save();
            
            // Track student engagement if a student's connection is accepted
            if (req.body.status === 'accepted') {
                const requester = await User.findById(connection.requester);
                if (requester && requester.role === 'student') {
                    await StudentEngagementTracker.incrementAlumniConnection(connection.requester, req.user.id);
                }
            }
            
            res.json(connection);
        } catch (error) {
            logger.error(`Respond connection error: ${error.message}`);
            res.status(500).json({ message: 'Failed to respond to connection' });
        }
    },
];

// This function fetches the connections of the logged-in user
// It retrieves both incoming and outgoing connections with accepted status
exports.getConnections = async (req, res) => {
    try {
        const connections = await Connection.find({
            $or: [{ requester: req.user.id }, { recipient: req.user.id }],
            status: 'accepted'
        }).populate('requester recipient', 'profile username');
        res.json(connections);
    } catch (error) {
        logger.error(`Get connections error: ${error.message}`);
        res.status(500).json({ message: 'Failed to fetch connections' });
    }
};

// This function creates a job opportunity by an admin
// It validates the input data and saves the job opportunity to the database
exports.createJobOpportunity = 
        async (req, res) => {
            // validating the request body
    validate([
        body('title').notEmpty().trim(),
        body('description').notEmpty().trim(),
        body('college').optional().trim(),
        body('department').optional().trim(),
        body('tags').optional().isArray(),
        body('applicationLink').optional().trim().isURL(),
        body('deadline').optional().isISO8601()
    ])
        try {
            const job = new JobOpportunity({
                ...req.body,
                createdBy: req.user.id
            });
            await job.save();
            await notifyJobOpportunity(job);
            // Log the action
            const logId = await logAdminAction({
                admin: req.user,
                action: 'job opportunity created',
                targetResource: 'JobOpportunity',
                targetId: job._id,
                details: { title: job.title, updates: req.body },
                ipAddress: req.ip,
            });
        
            await notifyAdminAction({
                college: job.college,
                message: `Job Opportunity "${job.title}" created`,
                actionType: 'Job Opportunity Created',
                logId,
            });
            res.status(201).json(job);
        } catch (error) {
            logger.error(`Create job opportunity error: ${error.message}`);
            res.status(500).json({ message: 'Failed to create job opportunity' });
        }
    }
;

// close a job opportunity
exports.closeJobOpportunity = async (req, res) => {
    try {
        const job = await JobOpportunity.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job opportunity not found' });
        job.status = 'closed';
        await job.save();
        await notifyJobOpportunity(job);
        // Log the action
        const logId = await logAdminAction({
            admin: req.user,
            action: 'job opportunity closed',
            targetResource: 'JobOpportunity',
            targetId: job._id,
        });
        await notifyAdminAction({
            college: job.college,
            message: `Job Opportunity "${job.title}" closed`,
            actionType: 'Job Opportunity Closed',
            logId,
        });
        res.json(job);
    } catch (error) {
        logger.error(`Close job opportunity error: ${error.message}`);
        res.status(500).json({ message: 'Failed to close job opportunity' });
    }
};



// This function fetches job opportunities based on college and department
// It retrieves all job opportunities that are still open (deadline not passed)
exports.getJobOpportunities = async (req, res) => {
    try {
        const { college, department } = req.query;
        const query = { deadline: { $gte: new Date() } };

        if (college) query.college = college;
        if (department) query.department = department;

        const jobs = await JobOpportunity.find(query).populate('createdBy', 'username');
        res.json(jobs);
    } catch (error) {
        logger.error(`Get job opportunities error: ${error.message}`);
        res.status(500).json({ message: 'Failed to fetch job opportunities' });
    }
};

// This function allows students to search for mentors
exports.searchMentors = [
    query('college').optional().trim(),
    query('industry').optional().trim(),
    query('expertise').optional().trim(),
    async (req, res) => {
        try {
            const { college, industry, expertise } = req.query;
            const query = { role: 'alumni', 'profile.mentorshipAvailability': true };

            if (college) query.college = college;
            if (industry) query['profile.industry'] = industry;
            if (expertise) query['profile.expertise'] = expertise;

            const mentors = await User.find(query).select('profile username');
            res.json(mentors);
        } catch (error) {
            logger.error(`Search mentors error: ${error.message}`);
            res.status(500).json({ message: 'Failed to search mentors' });
        }
    },
];

// This function allows students to create a mentorship request
// It checks if the mentor is available and if a request already exists
exports.createMentorshipRequest = [
    param('id').isMongoId(),
    async (req, res) => {
        try {
            if (req.user.id === req.params.id) {
                return res.status(400).json({ message: 'Cannot mentor yourself' });
            }

            const mentor = await User.findById(req.params.id);
            if (!mentor || mentor.role !== 'alumni' || !mentor.profile.mentorshipAvailability) {
                return res.status(404).json({ message: 'Mentor not available' });
            }

            const existingMentorship = await Mentorship.findOne({
                student: req.user.id,
                mentor: req.params.id
            });
            if (existingMentorship) {
                return res.status(400).json({ message: 'Mentorship request already exists' });
            }            const mentorship = new Mentorship({
                student: req.user.id,
                mentor: req.params.id,
                status: 'pending'
            });
            await mentorship.save();
            
            // Track student engagement for mentorship request
            await StudentEngagementTracker.incrementMentorshipRequest(req.user.id, req.params.id);
            
            await notifyMentorshipRequest(mentorship);
            res.status(201).json(mentorship);
        } catch (error) {
            logger.error(`Create mentorship error: ${error.message}`);
            res.status(500).json({ message: 'Failed to create mentorship request' });
        }
    },
];

// This function allows mentors(alumni) to respond to mentorship requests
// It checks if the request exists and if the user is authorized to respond
// It also sends a notification to the student about the status of their request
exports.respondMentorshipRequest = [
    param('id').isMongoId(),
    body('status').isIn(['accepted', 'rejected']),
    async (req, res) => {
        try {
            const mentorship = await Mentorship.findById(req.params.id);
            if (!mentorship) return res.status(404).json({ message: 'Mentorship request not found' });
            if (mentorship.mentor.toString() !== req.user.id) {
                return res.status(403).json({ message: 'Unauthorized' });
            }
            if (mentorship.status !== 'pending') {
                return res.status(400).json({ message: 'Mentorship already responded' });
            }            mentorship.status = req.body.status;
            await mentorship.save();
            
            // Track student engagement if mentorship is accepted
            if (req.body.status === 'accepted') {
                await StudentEngagementTracker.incrementActiveMentorship(mentorship.student, req.user.id);
            }
            
            await notifyMentorshipStatus(mentorship, req.body.status);
            res.json(mentorship);
        } catch (error) {
            logger.error(`Respond mentorship error: ${error.message}`);
            res.status(500).json({ message: 'Failed to respond to mentorship' });
        }
    },
];

// This function alows students and mentors to send messages within a mentorship
// future implementation
exports.sendMessage = [
    param('mentorshipId').isMongoId(),
    body('content').notEmpty().trim(),
    async (req, res) => {
        try {
            const mentorship = await Mentorship.findById(req.params.mentorshipId);
            if (!mentorship) return res.status(404).json({ message: 'Mentorship not found' });
            if (mentorship.status !== 'accepted') {
                return res.status(400).json({ message: 'Mentorship not active' });
            }
            if (![mentorship.student.toString(), mentorship.mentor.toString()].includes(req.user.id)) {
                return res.status(403).json({ message: 'Unauthorized' });
            }

            const message = new Message({
                mentorship: req.params.mentorshipId,
                sender: req.user.id,
                content: req.body.content
            });
            await message.save();
            res.status(201).json(message);
        } catch (error) {
            logger.error(`Send message error: ${error.message}`);
            res.status(500).json({ message: 'Failed to send message' });
        }
    },
];

// This function retrieves messages within a mentorship
// It checks if the mentorship exists and if the user is authorized to view the messages
exports.getMessages = [
    param('mentorshipId').isMongoId(),
    async (req, res) => {
        try {
            const mentorship = await Mentorship.findById(req.params.mentorshipId);
            if (!mentorship) return res.status(404).json({ message: 'Mentorship not found' });
            if (![mentorship.student.toString(), mentorship.mentor.toString()].includes(req.user.id)) {
                return res.status(403).json({ message: 'Unauthorized' });
            }

            const messages = await Message.find({ mentorship: req.params.mentorshipId })
                .populate('sender', 'profile username');
            res.json(messages);
        } catch (error) {
            logger.error(`Get messages error: ${error.message}`);
            res.status(500).json({ message: 'Failed to fetch messages' });
        }
    },
];