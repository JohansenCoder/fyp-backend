// controllers/eventsController.js
const { parseAlmanac } = require('../services/almanacParser');
const { notifyNewEvent, notifyCancellation, notifyAdminAction } = require('../services/notificationService');
const AlmanacEvent = require('../models/AlmanacEventSchema');
const DynamicEvent = require('../models/DynamicEventSchema');
const Registration = require('../models/RegistrationSchema');
const User = require('../models/UserSchema');
const {validate} = require('../middlewares/validate');
const {logAdminAction} = require('../utils/auditLog');
const StudentEngagementTracker = require('../utils/studentEngagement');
const winston = require('winston');
const { body } = require('express-validator');

const logger = winston.createLogger({
    transports: [new winston.transports.Console()],
});


// Upload and process almanac PDF
exports.uploadAlmanac = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No PDF uploaded' });
        }
        const { events, warnings } = await parseAlmanac(req.file.path);
        res.json({ message: 'Almanac processed', events, warnings });
    } catch (err) {
        res.status(500).json({ error: `Almanac Upload error: ${err.message}` });
    }
};

// Get almanac events with optional filters
exports.getAlmanacEvents = async (req, res) => {
    try {
        const { college, eventType } = req.query;
        const query = {};
        if (college) query.college = college;
        if (eventType) query.eventType = eventType;
        const events = await AlmanacEvent.find(query);
        res.status(200).json(events);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching Almanac Events' });
    }
};

// Create a new dynamic event

exports.createDynamicEvent = async (req, res) => {

    // Validate request body
    validate([
        body('title').notEmpty().trim(),
        body('description').notEmpty().trim(),
        body('category').notEmpty().trim(),
        body('imageUrl').notEmpty().isURL(),
        body('maxAttendees').notEmpty().isInt({ min: 1 }),
        body('registrationLink').optional().isURL(),
        body('startDate').isISO8601(),
        body('endDate').isISO8601(),
        body('college').optional().isArray(),
        body('department').optional().isArray(),
        body('tags').optional().isArray(),
        body('organizer').notEmpty().isString(),
        body('location').notEmpty().isString(),
        body('status').notEmpty().isIn(['active', 'cancelled'])
    ]),
    async (req, res) => {
        try {
            const event = new DynamicEvent(req.body);
            await event.save();
            await notifyNewEvent(event);

            // log the event creation
            const logId = await logAdminAction({
                admin: req.user,
                action: 'event_created',
                targetResource: 'event',
                targetId: event._id,
                details: { title: event.title, college: event.college },
                ipAddress: req.ip,
            });
            // notify admin about the event creation
            await notifyAdminAction({
                college: event.college,
                message: `Event "${event.title}" created`,
                actionType: 'Event Creation',
                logId,
            });
            res.status(201).json(event);
        } catch (error) {
            logger.error(`Create event error: ${error.message}`);
            res.status(500).json({ message: 'Failed to create event' });
        }
    }
};

// Get dynamic events relevant to the user
exports.getDynamicEvents = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);

        if(!user) return res.status(404).json({message : "User not found"});
        const query = {
            status: 'active',
            $or: [
                { college: { $in: [user.college] } },
                { tags: { $in: user.interests } }
            ]
        };
        const events = await DynamicEvent.find(query);
        res.status(200).json(events);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch Dynamic Events' });
    }
};
// Update a dynamic event
exports.updateDynamicEvent = async (req, res) => {
    // Validate request body
    validate([
        body('title').optional().notEmpty().trim(),
        body('description').optional().notEmpty().trim(),
        body('category').optional().isIn(['workshop', 'seminar', 'conference', 'webinar']),
        body('imageUrl').optional().isURL(),
        body('maxAttendees').optional().isInt({ min: 1 }),
        body('registrationLink').optional().isURL(),
        body('startDate').optional().isISO8601(),
        body('endDate').optional().isISO8601(),
        body('college').optional().isArray(),
        body('department').optional().isArray(),
        body('tags').optional().isArray(),
        body('location').optional().isString(),
        body('status').optional().isIn(['active', 'cancelled'])
    ])
    try {
        const event = await DynamicEvent.findById(req.params.id);
        if (!event) return res.status(404).json({ error: 'Event not found' });
        if (event.createdBy.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }
        Object.assign(event, req.body);
        await event.save();
        // log the event update
        const logId = await logAdminAction({
            admin: req.user,
            action: 'event_updated',
            targetResource: 'event',
            targetId: event._id,
            details: { title: event.title, updates: req.body },
            ipAddress: req.ip,
        });
        // notify admin about the event update
        await notifyAdminAction({
            college: event.college,
            message: `Event "${event.title}" updated`,
            actionType: 'Event Update',
            logId,
        });

        res.status(200).json(event);
    } catch (err) {
        res.status(500).json({ error: 'Failed to Update Event' });
    }
};
// Cancel a dynamic event
exports.cancelDynamicEvent = async (req, res) => {
    try {
        const event = await DynamicEvent.findById(req.params.id);
        if (!event) return res.status(404).json({ error: 'Event not found' });
        if (event.createdBy.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }
        event.status = 'cancelled';
        await event.save();
        await event.remove();
        await notifyCancellation(event);
        // log the event cancellation
        const logId = await logAdminAction({
            admin: req.user,
            action: 'event_cancelled',
            targetResource: 'event',
            targetId: req.params.id,
            details: { title: event.title },
            ipAddress: req.ip,
        });
        // notify admin about the event cancellation
        await notifyAdminAction({
            college: event.college,
            message: `Event "${event.title}" canceled`,
            actionType: 'Event cancellation',
            logId,
        });

        res.json({ message: 'Event cancelled successfully' });
        res.json(event);
    } catch (err) {
        logger.error(`Cancel event error: ${err.message}`);
        res.status(500).json({ error: 'Failed to cancel Event' });
    }
};

// register for an event
exports.registerForEvent = [
    async (req, res) => {
        try {
            const event = await DynamicEvent.findById(req.params.id);
            if (!event) return res.status(404).json({ message: 'Event not found' });
            if (event.status !== 'active') return res.status(400).json({ message: 'Event is not active' });

            // check max attendees
            if (event.maxAttendees) {
                const attendeeCount = await Registration.countDocuments({
                    event: event._id,
                    status: 'registered',
                });
                if (attendeeCount >= event.maxAttendees) {
                    return res.status(400).json({ message: 'Event is full' });
                }
            }

           // Check if already registered
           const existingRegistration = await Registration.findOne({
            user: req.user._id,
            event: event._id,
            status: 'active',
           });
           if (existingRegistration) {
            return res.status(400).json({ message: 'Already registered' });
         }            // Create registration
            const registration = new Registration({
                user: req.user._id,
                event: event._id,
            });
            await registration.save();

            // Track student engagement for event registration
            if (req.user.role === 'student') {
                await StudentEngagementTracker.incrementEventRegistration(req.user._id, event._id);
            }

            // send notification
            const user = await User.findById(req.user.id).select('fcmTokens');
            if (user.fcmTokens?.length) {
                await require('../services/notifications').sendPushNotification({
                    tokens: user.fcmTokens,
                    title: `Registered: ${event.title}`,
                    body: `You are registered for "${event.title}" on ${event.startDate.toLocaleDateString()}.`,
                    data: { eventId: event._id.toString() },
                });
            }

            res.json({ message: 'Registered successfully' });
        } catch (error) {
            logger.error(`Register event error: ${error.message}`);
            res.status(500).json({ message: 'Failed to register' });
        }
    },
];

// unregister from an event
exports.unregisterFromEvent = 
    async (req, res) => {
        try {
            const event = await DynamicEvent.findById(req.params.id);
            if (!event) return res.status(404).json({ message: 'Event not found' });

            // Check if registered
            const registration = await Registration.findOne({
                user: req.user._id,
                event: event._id,
                status: 'active',
            });
            if (!registration) {
                return res.status(400).json({ message: 'Not registered' });
            }
             // update the status to unregistered
            registration.status = 'unregistered';
            await registration.save();

            // Track student engagement for event unregistration
            if (req.user.role === 'student') {
                await StudentEngagementTracker.decrementEventRegistration(req.user._id, event._id);
            }

            res.json({ message: 'Unregistered successfully' });
        } catch (error) {
            logger.error(`Unregister event error: ${error.message}`);
            res.status(500).json({ message: 'Failed to unregister' });
        }
    };


