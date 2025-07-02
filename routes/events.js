const express = require('express');
const router = express.Router();
const { authMiddleware, restrictToSystemAdmin, restrictToAdmin } = require('../middlewares/auth');
const  validate = require('../middlewares/validate');
const { body } = require('express-validator'); // Import body from express-validator
const upload = require('../middlewares/upload');
const {
  uploadAlmanac,
  getAlmanacEvents,
  createDynamicEvent,
  getDynamicEvents,
  updateDynamicEvent,
  cancelEvent,
  activateEvent,
  completeEvent,
  deleteEvent,
  registerForEvent,
  unregisterFromEvent,
  getEventAttendees,
  getUserRegisteredEvents,
} = require('../controllers/eventController');
const { registerDeviceToken, updateFcmToken } = require('../controllers/notificationController');

// Upload almanac PDF (admin only)
router.post('/almanac/upload', authMiddleware, restrictToSystemAdmin, upload.single('almanac'), uploadAlmanac);

// Get almanac events (public for authenticated users)
router.get('/almanac', authMiddleware, getAlmanacEvents);

// Create dynamic event (admin only, supports multiple files)
router.post(
  '/dynamic',
  validate([
    body('title').notEmpty().trim(),
    body('description').notEmpty().trim(),
    body('category').notEmpty().isIn(['workshop', 'seminar', 'conference', 'webinar']),
    body('maxAttendees').optional().isInt({ min: 1 }),
    body('registrationLink').optional().isURL(),
    body('startTime').notEmpty().isISO8601(), // Changed to startTime
    body('endTime').notEmpty().isISO8601(), // Changed to endTime
    body('date').notEmpty().isISO8601(), // Use date for event date
    body('contactEmail').notEmpty().isEmail(), // New field for contact email
    body('contactPhone').notEmpty().isString(), // New field for contact phone
    body('college').optional().isArray(),
    body('department').optional().isArray(),
    body('tags').optional().isArray(),
    body('organizer').notEmpty().isString(),
    body('targetRoles').notEmpty().isIn(['student', 'visitor', 'alumni']),
    body('location').isString(),
    body('status').optional().isIn(['active', 'cancelled']),
  ]),
  authMiddleware,
  restrictToAdmin,
  upload.array('media', 5),
  createDynamicEvent
);

// Get dynamic events (filtered by user’s college/interests)
router.get('/dynamic', authMiddleware, getDynamicEvents);

// Update dynamic event (admin only, supports multiple files)
router.put(
  '/dynamic/:id',
  validate([
    body('title').optional().notEmpty().trim(),
    body('description').optional().notEmpty().trim(),
    body('category').optional().isIn(['workshop', 'seminar', 'conference', 'webinar']),
    body('maxAttendees').optional().isInt({ min: 1 }),
    body('registrationLink').optional().isURL(),
    body('startDate').optional().isISO8601(),
    body('endDate').optional().isISO8601(),
    body('targetRoles').optional().isIn(['student', 'visitor', 'alumni']),
    body('college').optional().isArray(),
    body('department').optional().isArray(),
    body('tags').optional().isArray(),
    body('location').optional().isString(),
    body('status').optional().isIn(['active', 'cancelled']),
  ]),
  authMiddleware,
  restrictToAdmin,
  upload.array('media', 5),
  updateDynamicEvent
);

/// Cancel event
router.patch('/dynamic/:id/cancel', authMiddleware, cancelEvent);

// Activate event
router.patch('/dynamic/:id/activate', authMiddleware, activateEvent);

// Complete event
router.patch('/dynamic/:id/complete', authMiddleware, completeEvent);

// Delete event
router.delete('/dynamic/:id', authMiddleware, deleteEvent);

// Register to event
router.post('/register/:id', authMiddleware, registerForEvent); // Updated to match controller

// Unregister from event
router.post('/unregister/:id', authMiddleware, unregisterFromEvent);

// Add this route after your existing routes
router.get('/dynamic/:id/attendees', authMiddleware, getEventAttendees);

// Get current user's registered events
router.get('/my-registrations', authMiddleware, getUserRegisteredEvents);

// Register device token for push notifications
router.post('/register-token', authMiddleware, registerDeviceToken);

// Update FCM token
router.post('/fcm-token', authMiddleware, updateFcmToken);

module.exports = router;