// controllers/eventsController.js
const { parseAlmanac } = require('../services/almanacParser');
const { notifyNewEvent, notifyCancellation } = require('../services/notificationService');
const AlmanacEvent = require('../models/AlmanacEventSchema');
const DynamicEvent = require('../models/DynamicEventSchema');
const User = require('../models/UserSchema');
const {validate} = require('../middlewares/validate');

// Upload and process almanac PDF
exports.uploadAlmanac = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No PDF uploaded' });
        }
        const { events, warnings } = await parseAlmanac(req.file.path);
        res.json({ message: 'Almanac processed', events, warnings });
    } catch (err) {
        res.status(500).json({ error: `Processing error: ${err.message}` });
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
        res.json(events);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Create a new dynamic event

exports.createDynamicEvent = async (req, res) => {

    // Validate request body
    validate([
        body('title').notEmpty().trim(),
        body('description').notEmpty().trim(),
        body('category').isIn(['workshop', 'seminar', 'conference', 'webinar']),
        body('imageUrl').optional().isURL(),
        body('attendees').optional().isArray(),
        body('maxAttendees').optional().isInt({ min: 1 }),
        body('registrationLink').optional().isURL(),
        body('startDate').isISO8601(),
        body('endDate').isISO8601(),
        body('college').optional().isArray(),
        body('department').optional().isArray(),
        body('tags').optional().isArray(),
        body('organizer').optional().isString(),
        body('location').optional().isString(),
        body('status').optional().isIn(['active', 'cancelled'])
    ]),
    async (req, res) => {
        try {
            const event = new DynamicEvent({
                ...req.body,
                organizer: req.user.id,
            });
            await event.save();
            await notifyNewEvent(event);
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
        const query = {
            status: 'active',
            $or: [
                { college: { $in: [user.college] } },
                { tags: { $in: user.interests } }
            ]
        };
        const events = await DynamicEvent.find(query);
        res.json(events);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
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
        body('attendees').optional().isArray(),
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
        if (event.organizer.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }
        Object.assign(event, req.body);
        await event.save();
        res.json(event);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};
// Cancel a dynamic event
exports.cancelDynamicEvent = async (req, res) => {
    try {
        const event = await DynamicEvent.findById(req.params.id);
        if (!event) return res.status(404).json({ error: 'Event not found' });
        if (event.organizer.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }
        event.status = 'cancelled';
        await event.save();
        await notifyCancellation(event);
        await event.remove();
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
            if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
                return res.status(400).json({ message: 'Event is full' });
            }
            if (event.attendees.includes(req.user.id)) {
                return res.status(400).json({ message: 'Already registered' });
            }

            event.attendees.push(req.user.id);
            await event.save();

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
exports.unregisterFromEvent = [
    async (req, res) => {
        try {
            const event = await DynamicEvent.findById(req.params.id);
            if (!event) return res.status(404).json({ message: 'Event not found' });
            if (!event.attendees.includes(req.user.id)) {
                return res.status(400).json({ message: 'Not registered' });
            }
            event.attendees = event.attendees.filter(id => id.toString() !== req.user.id);
            await event.save();
            res.json({ message: 'Unregistered successfully' });
        } catch (error) {
            logger.error(`Unregister event error: ${error.message}`);
            res.status(500).json({ message: 'Failed to unregister' });
        }
    },
];


