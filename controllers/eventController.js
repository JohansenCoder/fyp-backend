// controllers/eventsController.js
const cloudinary = require('../config/cloudinary');
const { parseAlmanac } = require('../services/almanacParser');
const { notifyNewEvent, notifyCancellation, notifyAdminAction } = require('../services/notificationService');
const AlmanacEvent = require('../models/AlmanacEventSchema');
const DynamicEvent = require('../models/DynamicEventSchema');
const User = require('../models/UserSchema');
const { logAdminAction } = require('../utils/auditLog');
const EngagementTracker = require('../utils/engagement');
const winston = require('winston');
const { body } = require('express-validator');

const logger = winston.createLogger({
  transports: [new winston.transports.Console()],
});

// Helper function to extract Cloudinary public ID from URL
const getCloudinaryPublicId = (url) => {
  try {
    // Extract public ID from Cloudinary URL
    // Example URL: https://res.cloudinary.com/udsmconnect/image/upload/v1234567890/udsm_events/filename.jpg
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    const publicId = filename.split('.')[0];
    return `udsm_events/${publicId}`;
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
};


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
exports.createDynamicEvent = [
  async (req, res) => {
    try {
      // The frontend now uploads media and sends the media array directly
      // Expect req.body.media to be an array of { url, type }
      const media = Array.isArray(req.body.media) ? req.body.media : [];

      const eventData = {
        ...req.body,
        media,
        createdBy: req.user.id,
      };

      const event = new DynamicEvent(eventData);
      await event.save();

      await EngagementTracker.incrementEventCreation(req.user.id, event._id);

      await notifyNewEvent(event);
      const logId = await logAdminAction({
        admin: req.user,
        action: 'event_created',
        targetResource: 'event',
        targetId: event._id,
        details: { title: event.title, college: event.college },
        ipAddress: req.ip,
      });
      await notifyAdminAction({
        college: event.college,
        message: `Event "${event.title}" created`,
        actionType: 'Event Creation',
        logId,
      });

      res.status(201).json(event);
    } catch (error) {
      logger.error(`Create event error: ${error.message}`);
      res.status(500).json({
        message: 'Failed to create event',
        error: error.message
      });
    }
  },
];

// Get dynamic events relevant to the user
exports.getDynamicEvents = async (req, res) => {
  try {
    console.log('Getting events for user:', req.user); // Debug log
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });
    
    let query = {};

    // Apply filters based on user role
    if (user.role === 'system_admin') {
      // System admin can see all events regardless of status or college
      // No filters applied
      console.log('System admin - fetching all events');
    } else if (user.role === 'college_admin') {
      // College admin can see all events in their college regardless of status
      query.college = { $in: [user.college] }; // Handle both string and array college fields
      console.log('College admin - fetching events for college:', user.college);
    } else {
      // Regular users (students, alumni, etc.) can only see active events
      // and only events relevant to their college
      query.status = 'active';
      query.college = { $in: [user.college] }; // Handle both string and array college fields
      console.log('Regular user - fetching active events for college:', user.college);
    }

    const events = await DynamicEvent.find(query)
      .populate('createdBy', 'firstName lastName email role')
      .sort({ startDate: 1 }); // Sort by start date

    // Add additional info for each event
    const eventsWithDetails = events.map(event => ({
      ...event.toObject(),
      totalAttendees: event.Attendees ? event.Attendees.length : 0,
      isRegistered: event.Attendees ? event.Attendees.includes(user._id) : false,
      canManage: event.createdBy._id.toString() === user._id.toString() || 
                 user.role === 'system_admin' || 
                 (user.role === 'college_admin' && event.college.includes(user.college))
    }));

    console.log('Found events:', events.length); // Debug log
    res.status(200).json({
      message: 'Events retrieved successfully',
      count: events.length,
      events: eventsWithDetails,
      userRole: user.role,
      userCollege: user.college
    });
  } catch (err) {
    console.error('Get dynamic events detailed error:', err); // More detailed error log
    logger.error(`Get dynamic events error: ${err.message}`);
    res.status(500).json({ error: 'Failed to fetch Dynamic Events' });
  }
};
// Update a dynamic event
exports.updateDynamicEvent = [
  async (req, res) => {
    try {
      const event = await DynamicEvent.findById(req.params.id);
      if (!event) return res.status(404).json({ error: 'Event not found' });
      if (event.createdBy.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      // The frontend now uploads media and sends the media array directly
      // Expect req.body.media to be an array of { url, type }
      let media = Array.isArray(req.body.media) ? req.body.media : event.media || [];

      // Optionally, allow removing media via request body
      if (req.body.removeMedia) {
        const removeUrls = Array.isArray(req.body.removeMedia) ? req.body.removeMedia : [req.body.removeMedia];
        media = media.filter(m => !removeUrls.includes(m.url));
      }

      const updatedData = {
        ...req.body,
        media,
        updatedAt: Date.now(),
      };

      Object.assign(event, updatedData);
      await event.save();

      const logId = await logAdminAction({
        admin: req.user,
        action: 'event_updated',
        targetResource: 'event',
        targetId: event._id,
        details: { title: event.title, updates: req.body },
        ipAddress: req.ip,
      });

      await notifyAdminAction({
        college: event.college,
        message: `Event "${event.title}" updated`,
        actionType: 'Event Update',
        logId,
      });

      res.status(200).json(event);
    } catch (err) {
      logger.error(`Update event error: ${err.message}`);
      console.error('Update event error:', err);
      res.status(500).json({ error: 'Failed to update event' });
    }
  },
];
// Cancel an event (change status from active to cancelled)
exports.cancelEvent = async (req, res) => {
  try {
    const event = await DynamicEvent.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Check authorization - only event creator, college admins, or system admins can cancel
    const isCreator = event.createdBy.toString() === req.user.id;
    const isCollegeAdmin = req.user.role === 'college_admin' && 
                           event.college.includes(req.user.college);
    const isSystemAdmin = req.user.role === 'system_admin';

    if (!isCreator && !isCollegeAdmin && !isSystemAdmin) {
      return res.status(403).json({ message: 'Not authorized to cancel this event' });
    }

    // Check if event is already cancelled
    if (event.status === 'cancelled') {
      return res.status(400).json({ message: 'Event is already cancelled' });
    }

    // Update event status
    event.status = 'cancelled';
    event.updatedAt = new Date();
    await event.save();

    // Notify all registered attendees about the cancellation
    const attendeeUsers = await User.find({ _id: { $in: event.Attendees } }).select('fcmTokens');
    const allTokens = attendeeUsers.flatMap(user => user.fcmTokens || []);
    
    if (allTokens.length > 0) {
      await require('../services/notifications').sendPushNotification({
        tokens: allTokens,
        title: `Event Cancelled: ${event.title}`,
        body: `The event "${event.title}" scheduled for ${event.date.toLocaleDateString()} has been cancelled.`,
        data: { eventId: event._id.toString(), type: 'event_cancelled' },
      });
    }

    // Log the action
    const logId = await logAdminAction({
      admin: req.user,
      action: 'event_cancelled',
      targetResource: 'event',
      targetId: event._id,
      details: { 
        title: event.title, 
        attendeesCount: event.Attendees.length,
        cancelledBy: req.user.id
      },
      ipAddress: req.ip,
    });

    await notifyAdminAction({
      college: event.college,
      message: `Event "${event.title}" cancelled by ${req.user.username}`,
      actionType: 'Event Cancellation',
      logId,
    });

    res.json({
      message: 'Event cancelled successfully',
      event: {
        id: event._id,
        title: event.title,
        status: event.status,
        attendeesNotified: allTokens.length
      }
    });
  } catch (error) {
    console.error('Cancel event error:', error);
    logger.error(`Cancel event error: ${error.message}`);
    res.status(500).json({ message: 'Failed to cancel event' });
  }
};

// Activate an event (change status from cancelled to active)
exports.activateEvent = async (req, res) => {
  try {
    const event = await DynamicEvent.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Check authorization - only event creator, college admins, or system admins can activate
    const isCreator = event.createdBy.toString() === req.user.id;
    const isCollegeAdmin = req.user.role === 'college_admin' && 
                           event.college.includes(req.user.college);
    const isSystemAdmin = req.user.role === 'system_admin';

    if (!isCreator && !isCollegeAdmin && !isSystemAdmin) {
      return res.status(403).json({ message: 'Not authorized to activate this event' });
    }

    // Check if event is not cancelled
    if (event.status !== 'cancelled') {
      return res.status(400).json({ message: 'Only cancelled events can be activated' });
    }

    // Check if event date hasn't passed
    const eventDate = new Date(event.date);
    const now = new Date();
    if (eventDate < now) {
      return res.status(400).json({ message: 'Cannot activate past events' });
    }

    // Update event status
    event.status = 'active';
    event.updatedAt = new Date();
    await event.save();

    // Notify all registered attendees about the reactivation
    const attendeeUsers = await User.find({ _id: { $in: event.Attendees } }).select('fcmTokens');
    const allTokens = attendeeUsers.flatMap(user => user.fcmTokens || []);
    
    if (allTokens.length > 0) {
      await require('../services/notifications').sendPushNotification({
        tokens: allTokens,
        title: `Event Reactivated: ${event.title}`,
        body: `The event "${event.title}" scheduled for ${event.date.toLocaleDateString()} is now active again.`,
        data: { eventId: event._id.toString(), type: 'event_activated' },
      });
    }

    // Log the action
    const logId = await logAdminAction({
      admin: req.user,
      action: 'event_activated',
      targetResource: 'event',
      targetId: event._id,
      details: { 
        title: event.title, 
        attendeesCount: event.Attendees.length,
        activatedBy: req.user.id
      },
      ipAddress: req.ip,
    });

    await notifyAdminAction({
      college: event.college,
      message: `Event "${event.title}" reactivated by ${req.user.username}`,
      actionType: 'Event Activation',
      logId,
    });

    res.json({
      message: 'Event activated successfully',
      event: {
        id: event._id,
        title: event.title,
        status: event.status,
        attendeesNotified: allTokens.length
      }
    });
  } catch (error) {
    console.error('Activate event error:', error);
    logger.error(`Activate event error: ${error.message}`);
    res.status(500).json({ message: 'Failed to activate event' });
  }
};

// Complete an event (change status from active to completed)
exports.completeEvent = async (req, res) => {
  try {
    const event = await DynamicEvent.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Check authorization - only event creator, college admins, or system admins can complete
    const isCreator = event.createdBy.toString() === req.user.id;
    const isCollegeAdmin = req.user.role === 'college_admin' && 
                           event.college.includes(req.user.college);
    const isSystemAdmin = req.user.role === 'system_admin';

    if (!isCreator && !isCollegeAdmin && !isSystemAdmin) {
      return res.status(403).json({ message: 'Not authorized to complete this event' });
    }

    // Check if event is in a valid state to be completed
    if (event.status === 'completed') {
      return res.status(400).json({ message: 'Event is already completed' });
    }

    if (event.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot complete a cancelled event' });
    }

    // Optional: Check if event date has passed (you might want to allow manual completion)
    const eventDate = new Date(event.date);
    const now = new Date();
    if (eventDate > now) {
      // You can either prevent completion of future events or allow it
      // Uncomment the line below if you want to prevent completing future events
      // return res.status(400).json({ message: 'Cannot complete future events' });
    }

    // Update event status
    event.status = 'completed';
    event.updatedAt = new Date();
    await event.save();

    // Update engagement tracking for all attendees who attended
    const attendeeUsers = await User.find({ _id: { $in: event.Attendees } });
    
    // Track event attendance for students and alumni
    for (const user of attendeeUsers) {
      if (user.role === 'student') {
        await EngagementTracker.incrementEventRegistration(user._id, event._id);
      } else if (user.role === 'alumni') {
        await EngagementTracker.incrementEventRegistration(user._id, event._id);
      }
    }

    // Notify all attendees about the event completion
    const allTokens = attendeeUsers.flatMap(user => user.fcmTokens || []);
    
    if (allTokens.length > 0) {
      await require('../services/notifications').sendPushNotification({
        tokens: allTokens,
        title: `Event Completed: ${event.title}`,
        body: `Thank you for attending "${event.title}". We hope you enjoyed the event!`,
        data: { eventId: event._id.toString(), type: 'event_completed' },
      });
    }

    // Send feedback/rating request notification (optional)
    if (allTokens.length > 0) {
      setTimeout(async () => {
        await require('../services/notifications').sendPushNotification({
          tokens: allTokens,
          title: `Rate "${event.title}"`,
          body: `How was your experience? Please rate and provide feedback for this event.`,
          data: { 
            eventId: event._id.toString(), 
            type: 'event_feedback_request',
            action: 'rate_event'
          },
        });
      }, 30000); // Send feedback request after 30 seconds
    }

    // Log the action
    const logId = await logAdminAction({
      admin: req.user,
      action: 'event_completed',
      targetResource: 'event',
      targetId: event._id,
      details: { 
        title: event.title, 
        attendeesCount: event.Attendees.length,
        completedBy: req.user.id,
        eventDate: event.date
      },
      ipAddress: req.ip,
    });

    await notifyAdminAction({
      college: event.college,
      message: `Event "${event.title}" marked as completed by ${req.user.username}`,
      actionType: 'Event Completion',
      logId,
    });

    res.json({
      message: 'Event completed successfully',
      event: {
        id: event._id,
        title: event.title,
        status: event.status,
        attendeesNotified: allTokens.length,
        totalAttendees: event.Attendees.length
      }
    });
  } catch (error) {
    console.error('Complete event error:', error);
    logger.error(`Complete event error: ${error.message}`);
    res.status(500).json({ message: 'Failed to complete event' });
  }
};

// Delete an event permanently
exports.deleteEvent = async (req, res) => {
  try {
    const event = await DynamicEvent.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Check authorization - only event creator, college admins, or system admins can delete
    const isCreator = event.createdBy.toString() === req.user.id;
    const isCollegeAdmin = req.user.role === 'college_admin' && 
                           event.college.includes(req.user.college);
    const isSystemAdmin = req.user.role === 'system_admin';

    if (!isCreator && !isCollegeAdmin && !isSystemAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    // Store event details for logging and notifications
    const eventDetails = {
      id: event._id,
      title: event.title,
      attendeesCount: event.Attendees.length,
      college: event.college,
      media: event.media || []
    };

    // Notify all registered attendees about the deletion
    const attendeeUsers = await User.find({ _id: { $in: event.Attendees } }).select('fcmTokens');
    const allTokens = attendeeUsers.flatMap(user => user.fcmTokens || []);
    
    if (allTokens.length > 0) {
      await require('../services/notifications').sendPushNotification({
        tokens: allTokens,
        title: `Event Deleted: ${event.title}`,
        body: `The event "${event.title}" has been permanently deleted.`,
        data: { eventId: event._id.toString(), type: 'event_deleted' },
      });
    }

    // Delete media from Cloudinary
    for (const media of eventDetails.media) {
      const publicId = getCloudinaryPublicId(media.url);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (error) {
          logger.error(`Error deleting media from Cloudinary: ${error.message}`);
        }
      }
    }

    // Decrement engagement tracking for event creators
    if (req.user.role === 'system_admin' || req.user.role === 'college_admin') {
      await EngagementTracker.decrementEventCreation(event.createdBy, event._id);
    }

    // Remove event from all attendees' registered events (if tracking in user model)
    await User.updateMany(
      { _id: { $in: event.Attendees } },
      { $pull: { registeredEvents: event._id } }
    );

    // Delete the event
    await event.deleteOne();

    // Log the action
    const logId = await logAdminAction({
      admin: req.user,
      action: 'event_deleted',
      targetResource: 'event',
      targetId: eventDetails.id,
      details: { 
        title: eventDetails.title, 
        attendeesCount: eventDetails.attendeesCount,
        deletedBy: req.user.id,
        college: eventDetails.college
      },
      ipAddress: req.ip,
    });

    await notifyAdminAction({
      college: eventDetails.college,
      message: `Event "${eventDetails.title}" permanently deleted by ${req.user.username}`,
      actionType: 'Event Deletion',
      logId,
    });

    res.json({
      message: 'Event deleted successfully',
      deletedEvent: {
        id: eventDetails.id,
        title: eventDetails.title,
        attendeesNotified: allTokens.length
      }
    });
  } catch (error) {
    console.error('Delete event error:', error);
    logger.error(`Delete event error: ${error.message}`);
    res.status(500).json({ message: 'Failed to delete event' });
  }
};

// register for an event
exports.registerForEvent = async (req, res) => {
  try {
    const event = await DynamicEvent.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.status !== 'active') return res.status(400).json({ message: 'Event is not active' });

    // Check max attendees
    if (event.maxAttendees && event.Attendees.length >= event.maxAttendees) {
      return res.status(400).json({ message: 'Event is full' });
    }

    // Check if already registered
    if (event.Attendees.includes(req.user.id)) {
      return res.status(400).json({ message: 'Already registered' });
    }

    // Add user to attendees array
    event.Attendees.push(req.user.id);
    await event.save();

    // Track student engagement for event registration
    if (req.user.role === 'student') {
      await EngagementTracker.incrementEventRegistration(req.user.id, event._id);
    }

    // Send notification
    const user = await User.findById(req.user.id).select('fcmTokens');
    if (user.fcmTokens?.length) {
      await require('../services/notifications').sendPushNotification({
        tokens: user.fcmTokens,
        title: `Registered: ${event.title}`,
        body: `You are registered for "${event.title}" on ${event.startDate.toLocaleDateString()}.`,
        data: { eventId: event._id.toString() },
      });
    }

    res.json({
      message: 'Registered successfully',
      attendeesCount: event.Attendees.length
    });
  } catch (error) {
    console.error('Register event error:', error);
    logger.error(`Register event error: ${error.message}`);
    res.status(500).json({ message: 'Failed to register' });
  }
};

// unregister from an event
exports.unregisterFromEvent = async (req, res) => {
  try {
    const event = await DynamicEvent.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Check if registered
    if (!event.Attendees.includes(req.user.id)) {
      return res.status(400).json({ message: 'Not registered' });
    }

    // Remove user from attendees array
    event.Attendees = event.Attendees.filter(
      attendeeId => attendeeId.toString() !== req.user.id
    );
    await event.save();

    // Track student engagement for event unregistration
    if (req.user.role === 'student') {
      await EngagementTracker.decrementEventRegistration(req.user.id, event._id);
    }

    res.json({
      message: 'Unregistered successfully',
      attendeesCount: event.Attendees.length
    });
  } catch (error) {
    console.error('Unregister event error:', error);
    logger.error(`Unregister event error: ${error.message}`);
    res.status(500).json({ message: 'Failed to unregister' });
  }
};

// Get event attendees (for admins/organizers)
exports.getEventAttendees = async (req, res) => {
  try {
    const event = await DynamicEvent.findById(req.params.id)
      .populate('Attendees', 'firstName lastName email college department')
      .populate('createdBy', 'firstName lastName email');

    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Only allow event creator or admin to view attendees
if (event.createdBy._id.toString() !== req.user.id && 
    !['system_admin', 'college_admin'].includes(req.user.role)) {
  console.warn(`Unauthorized access attempt by user ${req.user.id} for event ${event._id}`);
  return res.status(403).json({ message: 'Not authorized to view attendees' });
}

    res.json({
      eventTitle: event.title,
      totalAttendees: event.Attendees.length,
      maxAttendees: event.maxAttendees,
      attendees: event.Attendees
    });
  } catch (error) {
    console.error('Get event attendees error:', error);
    res.status(500).json({ message: 'Failed to get event attendees' });
  }
};

// Get events that the current user has registered for
exports.getUserRegisteredEvents = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find all events where the user is in the Attendees array
    const registeredEvents = await DynamicEvent.find({
      Attendees: userId,
      status: 'active' // Only get active events
    })
    .populate('createdBy', 'firstName lastName email')
    .select('title description startDate endDate location category media maxAttendees Attendees createdAt')
    .sort({ startDate: 1 }); // Sort by start date

    // Add additional info for each event
    const eventsWithDetails = registeredEvents.map(event => ({
      ...event.toObject(),
      totalAttendees: event.Attendees.length,
      isRegistered: true, // Always true since we're filtering by registered events
      registrationDate: event.createdAt // You might want to track actual registration date
    }));

    res.json({
      message: 'User registered events retrieved successfully',
      count: registeredEvents.length,
      events: eventsWithDetails
    });
  } catch (error) {
    console.error('Get user registered events error:', error);
    logger.error(`Get user registered events error: ${error.message}`);
    res.status(500).json({ message: 'Failed to get registered events' });
  }
};

// Get events for a specific user by ID (admin only)
exports.getUserRegisteredEventsById = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if the requesting user is admin or the user themselves
    if (req.user.id !== userId && !['system_admin', 'college_admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized to view this user\'s events' });
    }

    // Verify the target user exists
    const targetUser = await User.findById(userId).select('firstName lastName email role college');
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find all events where the user is in the Attendees array
    const registeredEvents = await DynamicEvent.find({
      Attendees: userId
    })
    .populate('createdBy', 'firstName lastName email')
    .select('title description startDate endDate location category media maxAttendees Attendees status createdAt')
    .sort({ startDate: 1 });

    const eventsWithDetails = registeredEvents.map(event => ({
      ...event.toObject(),
      totalAttendees: event.Attendees.length,
      isRegistered: true
    }));

    res.json({
      message: 'User registered events retrieved successfully',
      user: {
        id: targetUser._id,
        name: `${targetUser.firstName} ${targetUser.lastName}`,
        email: targetUser.email,
        role: targetUser.role,
        college: targetUser.college
      },
      count: registeredEvents.length,
      events: eventsWithDetails
    });
  } catch (error) {
    console.error('Get user registered events by ID error:', error);
    logger.error(`Get user registered events by ID error: ${error.message}`);
    res.status(500).json({ message: 'Failed to get user registered events' });
  }
};
