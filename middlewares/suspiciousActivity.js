const FailedAttempt = require('../models/FailedAttemptSchema');
const { sendEmail } = require('../services/emailService');

const trackFailedAttempts = async (req, res, next) => {
    const { username } = req.body;
    try {
        let attempt = await FailedAttempt.findOne({ username });
        if (!attempt) {
            attempt = new FailedAttempt({ username, attempts: 0, lastAttempt: new Date() });
        }
        attempt.attempts += 1;
        attempt.lastAttempt = new Date();
        await attempt.save();

        if (attempt.attempts >= 5) {
            const user = await User.findOne({ username });
            if (user) {
                await sendEmail({
                    to: user.email,
                    subject: 'UDSM Connect: Suspicious Activity Detected',
                    text: 'Multiple failed login attempts were detected on your account. Please contact support if this was not you.',
                    html: '<p>Multiple failed login attempts were detected on your account. Please <a href="mailto:support@udsmconnect.ac.tz">contact support</a> if this was not you.</p>',
                });
            }
            return res.status(429).json({ message: 'Too many failed attempts. Try again later.' });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: 'Error tracking attempts', error: error.message });
    }
};

const logFailedAttempt = async (username, ip) => {
    await FailedAttempt.create({ username, ip, timestamp: Date.now() });
};

module.exports = { trackFailedAttempts, logFailedAttempt };