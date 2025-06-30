// src/middleware/authSecurity.js
const rateLimit = require('express-rate-limit');
const FailedAttempt = require('../models/FailedAttemptSchema');
const User = require('../models/UserSchema');
const { sendEmail } = require('../services/emailService');
const winston = require('winston');

// Logger setup
const logger = winston.createLogger({
    transports: [new winston.transports.Console()],
});

// Rate limiter configuration
const rateLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 15 minutes
    max: 10, // 10 requests per IP
    message: {
        message: 'Too many requests from this IP, please try again after 5 minutes.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip, // Use IP as key
    handler: async (req, res) => {
        logger.warn(`Rate limit exceeded for IP: ${req.ip} on ${req.path}`);
        // Optionally log to AuditLog collection here
        res.status(429).json({
            message: 'Too many requests from this IP, please try again after 5 minutes.',
        });
    },
});

// Suspicious activity tracking
const trackSuspiciousActivity = async (req, res, next) => {
    // Check if req.body exists
    if (!req.body) {
        logger.warn('Request body is undefined, skipping suspicious activity tracking');
        return next();
    }

    const { username } = req.body;

    // Skip if no username (e.g., for forgot-password)
    if (!username) {
        logger.info('No username provided, skipping suspicious activity tracking');
        return next();
    }

    try {
        // Find or create failed attempt record
        let attempt = await FailedAttempt.findOne({ username });
        if (!attempt) {
            attempt = new FailedAttempt({
                username,
                attempts: 0,
                lastAttempt: new Date(),
            });
        }

        // Check if within lockout window (15 minutes)
        const lockoutWindow = 5 * 60 * 1000; // 15 minutes
        const timeSinceLastAttempt = Date.now() - new Date(attempt.lastAttempt).getTime();

        if (timeSinceLastAttempt > lockoutWindow) {
            // Reset attempts if lockout window has passed
            attempt.attempts = 0;
            attempt.lastAttempt = new Date();
        }

        // Increment attempts only on failed login (checked in authController)
        req.authSecurity = { attempt }; // Pass attempt to controller
        next();
    } catch (error) {
        logger.error(`Error tracking suspicious activity for ${username}: ${error.message}`);
        res.status(500).json({ message: 'Error processing request', error: error.message });
    }
};

// Combined middleware (authentication security)
const authSecurity = (req, res, next) => {
    // Apply rate limiter first
    rateLimiter(req, res, (rateLimitError) => {
        if (rateLimitError) {
            return  ; // Rate limit response already sent
        }
        // Then track suspicious activity
        trackSuspiciousActivity(req, res, next);
    });
};

// Utility to handle failed login attempts (called from authController)
const handleFailedLogin = async (req, attempt) => {
    try {
        attempt.attempts += 1;
        attempt.lastAttempt = new Date();
        await attempt.save();

        if (attempt.attempts >= 5) {
            const user = await User.findOne({ username: attempt.username });
            if (user) {
                await sendEmail({
                    to: user.email,
                    subject: 'UDSM Connect: Suspicious Activity Detected',
                    text: 'Multiple failed login attempts were detected on your account. Please contact support if this was not you.',
                    html: '<p>Multiple failed login attempts were detected on your account. Please <a href="mailto:mwijagejohansen02@gmail.com">contact support</a> if this was not you.</p>',
                });
                logger.info(`Suspicious activity email sent to ${user.email}`);
            }
            return { blocked: true, message: 'Too many failed attempts. Try again later.' };
        }
        return { blocked: false };
    } catch (error) {
        logger.error(`Error handling failed login for ${attempt.username}: ${error.message}`);
        throw error;
    }
};

module.exports = { authSecurity, handleFailedLogin };