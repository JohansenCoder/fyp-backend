// src/services/notifications.js
const admin = require('firebase-admin');
const cron = require('node-cron');
const User = require('../models/UserSchema');
const DynamicEvent = require('../models/DynamicEventSchema');
const News = require('../models/NewsSchema');
const Announcement = require('../models/AnnouncementSchema');
const JobOpportunity = require('../models/JobOpportunitySchema');
const Mentorship = require('../models/MentorshipRequestSchema');
const winston = require('winston');

const logger = winston.createLogger({
    transports: [new winston.transports.Console()],
});

// Initialize Firebase
try {
    admin.initializeApp({
        credential: admin.credential.cert(process.env.FIREBASE_SERVICE_ACCOUNT_PATH),
    });
    logger.info('Firebase initialized');
} catch (error) {
    logger.error(`Firebase initialization failed: ${error.message}`);
    throw error;
}

// Send push notification
exports.sendPushNotification = async ({ tokens, title, body, data = {} }) => {
    if (!tokens?.length) {
        logger.warn('No device tokens provided');
        return;
    }

    const message = {
        notification: { title, body },
        data,
        tokens,
    };

    try {
        const response = await admin.messaging().sendMulticast(message);
        logger.info(`Sent notifications to ${response.successCount} devices`);

        if (response.failureCount) {
            const failedTokens = response.responses
                .map((resp, idx) => (!resp.success ? message.tokens[idx] : null))
                .filter(Boolean);
            await User.updateMany(
                { fcmTokens: { $in: failedTokens } },
                { $pull: { fcmTokens: { $in: failedTokens } } }
            );
            logger.info(`Cleaned ${failedTokens.length} invalid tokens`);
        }
    } catch (error) {
        logger.error(`Notification error: ${error.message}`);
    }
};

// Notify new event
exports.notifyNewEvent = async (event) => {
    const query = { 'notificationPreferences.newEvents': true };
    if (event.college) {
        query.$or = [
            { college: event.college },
            { interests: { $in: event.tags || [] } },
        ];
    }

    const users = await User.find(query).select('fcmTokens');
    const tokens = users.flatMap(user => user.fcmTokens || []).filter(Boolean);

    if (tokens.length) {
        await exports.sendPushNotification({
            tokens,
            title: `New Event: ${event.title}`,
            body: `${event.description} on ${event.startDate.toLocaleDateString()} at ${event.location || 'TBD'}`,
            data: { eventId: event._id.toString() },
        });
        logger.info(`Notified ${tokens.length} users about event: ${event.title}`);
    } else {
        logger.info(`No users to notify for event: ${event.title}`);
    }
};

// Notify event cancellation
exports.notifyCancellation = async (event) => {
    const users = await User.find({
        _id: { $in: event.attendees },
        'notificationPreferences.cancellations': true,
    }).select('fcmTokens');
    const tokens = users.flatMap(user => user.fcmTokens || []).filter(Boolean);

    if (tokens.length) {
        await exports.sendPushNotification({
            tokens,
            title: `Cancelled: ${event.title}`,
            body: `Event on ${event.startDate.toLocaleDateString()} is cancelled.`,
            data: { eventId: event._id.toString() },
        });
        logger.info(`Notified ${tokens.length} users about cancellation: ${event.title}`);
    } else {
        logger.info(`No users to notify for cancellation: ${event.title}`);
    }
};

// Schedule event reminders
exports.scheduleEventReminders = () => {
    cron.schedule('0 8 * * *', async () => { // Run daily at 8 AM
        try {
            logger.info('Running event reminder job');
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            const tomorrowEnd = new Date(tomorrow);
            tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);

            const events = await DynamicEvent.find({
                startDate: { $gte: tomorrow, $lt: tomorrowEnd },
                status: 'active',
            });

            for (const event of events) {
                const users = await User.find({
                    _id: { $in: event.attendees },
                    'notificationPreferences.reminders': true,
                }).select('fcmTokens');
                const tokens = users.flatMap(user => user.fcmTokens || []).filter(Boolean);

                if (tokens.length) {
                    await exports.sendPushNotification({
                        tokens,
                        title: `Reminder: ${event.title}`,
                        body: `"${event.title}" is tomorrow at ${event.location || 'TBD'}.`,
                        data: { eventId: event._id.toString() },
                    });
                    logger.info(`Sent reminders for event: ${event.title}`);
                }
            }
        } catch (error) {
            logger.error(`Reminder job error: ${error.message}`);
        }
    }, {
        timezone: 'Africa/Dar_es_Salaam' // Tanzania timezone
    });
};

// Notify news
exports.notifyNews = async (news) => {
    const query = { 'notificationPreferences.news': true };
    if (news.college) query.college = news.college;
    if (news.targetRoles?.length) query.role = { $in: news.targetRoles };
    if (news.tags?.length) query.interests = { $in: news.tags };

    const users = await User.find(query).select('fcmTokens');
    const tokens = users.flatMap(user => user.fcmTokens || []).filter(Boolean);

    if (tokens.length) {
        await exports.sendPushNotification({
            tokens,
            title: `Campus News: ${news.title}`,
            body: news.content,
            data: { newsId: news._id.toString() },
        });
        logger.info(`Notified ${tokens.length} users about news: ${news.title}`);
    } else {
        logger.info(`No users to notify for news: ${news.title}`);
    }
};

// Notify announcement
exports.notifyAnnouncement = async (announcement) => {
    const query = { 'notificationPreferences.announcements': true };
    if (announcement.college) query.college = announcement.college;
    if (announcement.targetRoles?.length) query.role = { $in: announcement.targetRoles };

    const users = await User.find(query).select('fcmTokens');
    const tokens = users.flatMap(user => user.fcmTokens || []).filter(Boolean);

    if (tokens.length) {
        await exports.sendPushNotification({
            tokens,
            title: `Announcement: ${announcement.title}`,
            body: announcement.content,
            data: { announcementId: announcement._id.toString() },
        });
        logger.info(`Notified ${tokens.length} users about announcement: ${announcement.title}`);
    } else {
        logger.info(`No users to notify for announcement: ${announcement.title}`);
    }
};

// Notify job opportunity
exports.notifyJobOpportunity = async (job) => {
    const query = { 'notificationPreferences.jobs': true, role: 'alumni' };
    if (job.college) query.college = job.college;
    if (job.department) query['profile.department'] = job.department;
    if (job.tags?.length) query.interests = { $in: job.tags };

    const users = await User.find(query).select('fcmTokens');
    const tokens = users.flatMap(user => user.fcmTokens || []).filter(Boolean);

    if (tokens.length) {
        await exports.sendPushNotification({
            tokens,
            title: `Job Opportunity: ${job.title}`,
            body: `${job.description} Apply by ${job.deadline?.toLocaleDateString() || 'N/A'}.`,
            data: { jobId: job._id.toString() },
        });
        logger.info(`Notified ${tokens.length} users about job opportunity: ${job.title}`);
    } else {
        logger.info(`No users to notify for job opportunity: ${job.title}`);
    }
};

// Notify mentorship request
exports.notifyMentorshipRequest = async (mentorship) => {
    const mentor = await User.findById(mentorship.mentor).select('fcmTokens notificationPreferences');
    const student = await User.findById(mentorship.student).select('profile.firstName profile.lastName');

    if (mentor?.notificationPreferences.mentorship && mentor.fcmTokens?.length) {
        await exports.sendPushNotification({
            tokens: mentor.fcmTokens,
            title: 'New Mentorship Request',
            body: `${student.profile.firstName} ${student.profile.lastName} has requested you as a mentor.`,
            data: { mentorshipId: mentorship._id.toString() },
        });
        logger.info(`Notified mentor ${mentor._id} about mentorship request`);
    } else {
        logger.info(`No notification sent for mentorship request to mentor ${mentorship.mentor}`);
    }
};

// Notify mentorship status update
exports.notifyMentorshipStatus = async (mentorship, status) => {
    const student = await User.findById(mentorship.student).select('fcmTokens notificationPreferences');
    const mentor = await User.findById(mentorship.mentor).select('profile.firstName profile.lastName');

    if (student?.notificationPreferences.mentorship && student.fcmTokens?.length) {
        await exports.sendPushNotification({
            tokens: student.fcmTokens,
            title: `Mentorship Request ${status}`,
            body: `Your mentorship request to ${mentor.profile.firstName} ${mentor.profile.lastName} has been ${status}.`,
            data: { mentorshipId: mentorship._id.toString() },
        });
        logger.info(`Notified student ${student._id} about mentorship ${status}`);
    } else {
        logger.info(`No notification sent for mentorship ${status} to student ${mentorship.student}`);
    }
};

// Notify new story
exports.notifyNewStory = async (story) => {
    const query = { 'notificationPreferences.stories': true };
    if (story.college) query.college = story.college;

    const users = await User.find(query).select('fcmTokens');
    const tokens = users.flatMap(user => user.fcmTokens || []).filter(Boolean);

    if (tokens.length) {
        await exports.sendPushNotification({
            tokens,
            title: `New Story from ${story.college}`,
            body: `Check out the latest story from your college!`,
            data: { storyId: story._id.toString(), type: 'story' },
        });
        logger.info(`Notified ${tokens.length} users about story from ${story.college}`);
    } else {
        logger.info(`No users to notify for story from ${story.college}`);
    }
};

// Notify new post
exports.notifyNewPost = async (post) => {
    const query = { 'notificationPreferences.posts': true };
    if (post.college) query.college = post.college;
    if (post.targetRoles?.length) query.role = { $in: post.targetRoles };
    if (post.tags?.length) query.interests = { $in: post.tags };

    const users = await User.find(query).select('fcmTokens');
    const tokens = users.flatMap(user => user.fcmTokens || []).filter(Boolean);

    if (tokens.length) {
        await exports.sendPushNotification({
            tokens,
            title: `New Post: ${post.title}`,
            body: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : ''),
            data: { postId: post._id.toString(), type: 'post' },
        });
        logger.info(`Notified ${tokens.length} users about post: ${post.title}`);
    } else {
        logger.info(`No users to notify for post: ${post.title}`);
    }
};

// Notify admin action
exports.notifyAdminAction = async ({ college, message, actionType, logId }) => {
    const query = {
        'notificationPreferences.adminActions': true,
        role: { $in: ['college_admin', 'system_admin'] },
    };
    if (college) query.college = college;

    const users = await User.find(query).select('fcmTokens');
    const tokens = users.flatMap(user => user.fcmTokens || []).filter(Boolean);

    if (tokens.length) {
        await exports.sendPushNotification({
            tokens,
            title: `Admin Action: ${actionType}`,
            body: message,
            data: { type: 'admin_action', college, logId: logId?.toString() },
        });
        logger.info(`Notified ${tokens.length} admins about action: ${actionType}`);
    } else {
        logger.info(`No admins to notify for action: ${actionType}`);
    }
};

// Start reminder scheduler
exports.scheduleEventReminders();