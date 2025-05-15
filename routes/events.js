// routes/events.js
const express = require('express');
const router = express.Router();
const { authMiddleware, restrictToSystemAdmin, restrictToOrganizer } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const { uploadAlmanac,getAlmanacEvents,createDynamicEvent,getDynamicEvents,updateDynamicEvent,cancelDynamicEvent,registerForEvent,unregisterFromEvent} = require('../controllers/eventController');
const { registerDeviceToken, updateFcmToken } = require('../controllers/notificationController');

// Upload almanac PDF (admin only)
router.post('/almanac/upload', authMiddleware, restrictToSystemAdmin, upload.single('almanac'), uploadAlmanac);

// Get almanac events (public for authenticated users)
router.get('/almanac', authMiddleware, getAlmanacEvents);

// Create dynamic event (organizer/admin only)
router.post('/dynamic', authMiddleware, restrictToOrganizer, createDynamicEvent);

// Get dynamic events (filtered by user’s college/interests)
router.get('/dynamic', authMiddleware, getDynamicEvents);

// update dynamic event (organizer only)
router.put('/dynamic/:id', authMiddleware, restrictToOrganizer, updateDynamicEvent);

// Cancel dynamic event (organizer only)
router.delete('/dynamic/:id', authMiddleware, restrictToOrganizer, cancelDynamicEvent);

// register to event/category
router.post('/register', authMiddleware, registerForEvent);

// unregister from event/category
router.post('/unregister/:id', authMiddleware, unregisterFromEvent);

// Register device token for push notifications
router.post('/register-token', authMiddleware, registerDeviceToken);

// Update FCM token
router.post('/fcm-token', authMiddleware, updateFcmToken);

module.exports = router;