// src/controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/UserSchema');
const AuditLog = require('../models/AuditLogSchema');
const sanitize = require('mongo-sanitize');
const { sendEmail } = require('../services/emailService');
const { handleFailedLogin, authSecurity } = require('../middlewares/authSecurity');
const winston = require('winston');
const validate = require("../middlewares/validate")

const logger = winston.createLogger({
    transports: [new winston.transports.Console()],
});

exports.register = async (req, res) => {
    // validate request body
    validate([
        body('username').notEmpty().message('Username should not be empty').trim(),
        body('email').notEmpty().isEmail().message('Invalid email format').trim(),
        body('password').notEmpty().isLength({ min: 6 }).message('Password must be at least 6 characters long').trim(),
        body('role').notEmpty().isIn(['visitor']).message('Role must be visitor').trim(),
        body('profile').Optional().isObject().withMessage('Profile must be an object'),
        body('profile.firstName').Optional().isString().withMessage('First name must be a string').trim(),
        body('profile.lastName').Optional().isString().withMessage('Last name must be a string').trim(),
    ])
    try {
        // Added 'college' to destructured fields
        let { username, email, password, role, profile } = req.body;

        // Sanitize inputs
        username = sanitize(username);
        email = sanitize(email);
        college = sanitize(college); // Sanitize college field
        if (profile) {
            profile.firstName = sanitize(profile.firstName);
            profile.lastName = sanitize(profile.lastName);
        }


        // Check for existing user
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Username or email already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user with college field
        const user = new User({
            username,
            email,
            password: hashedPassword,
            role,
            profile,
        });
        await user.save();

        // Generate JWT
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

       

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                username: user.username,
                role: user.role,
                profile: user.profile,
            },
        });
    } catch (error) {
        logger.error(`Register error for ${req.body.username}: ${error.message}`);
        res.status(500).json({ message: 'Registration failed', error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        let { username, password } = req.body;
        const { attempt } = req.authSecurity || {};

        // Explicitly check input types
        if (typeof username !== 'string' || typeof password !== 'string') {
            logger.warn(`Invalid input type detected: ${JSON.stringify(req.body)}`);
            await AuditLog.create({
                action: 'potential_nosql_injection',
                performedBy: null,
                role: null,
                targetResource: 'login',
                targetId: null,
                details: `Invalid login input: ${JSON.stringify(req.body)}`,
                ipAddress: req.ip,
                timestamp: new Date(),
            });
            return res.status(400).json({ message: 'Username and password must be strings' });
        }

        // Sanitize username to prevent NoSQL injection
        username = sanitize(username);

        // Find user with sanitized input
        const user = await User.findOne({ username });
        if (!user) {
            if (attempt) {
                const result = await handleFailedLogin(req, attempt);
                if (result.blocked) {
                    return res.status(429).json({ message: result.message });
                }
            }
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            if (attempt) {
                const result = await handleFailedLogin(req, attempt);
                if (result.blocked) {
                    return res.status(429).json({ message: result.message });
                }
            }
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Reset attempts on successful login
        if (attempt) {
            attempt.attempts = 0;
            attempt.lastAttempt = new Date();
            await attempt.save();
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        // Update lastActive
        user.lastActive = Date.now();
        await user.save();

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                role: user.role,
                college: user.college, // Include college in response
                profile: user.profile,
            },
        });
    } catch (error) {
        logger.error(`Login error for ${req.body.username}: ${error.message}`);
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        await sendEmail({
            to: email,
            subject: 'UDSM Connect Password Reset',
            text: `Use this token to reset your password: ${resetToken}\nLink: http://localhost:7000/reset-password?token=${resetToken}`,
            html: `<p>Use this token to reset your password: <b>${resetToken}</b></p><p><a href="http://localhost:7000/reset-password?token=${resetToken}">Reset Password</a></p>`,
        });

        // Log password reset request
        await AuditLog.create({
            action: 'password_reset_request',
            performedBy: user._id,
            role: user.role,
            targetResource: 'user',
            targetId: user._id,
            ipAddress: req.ip,
            timestamp: new Date(),
            details: `Password reset requested for ${email}`,
        });

        res.json({ message: 'Password reset link sent' });
    } catch (error) {
        logger.error(`Forgot password error for ${req.body.email}: ${error.message}`);
        res.status(500).json({ message: 'Failed to send reset link', error: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        // Verify reset token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Update password
        user.password = await bcrypt.hash(password, 10);
        await user.save();

        // Log password reset
        await AuditLog.create({
            action: 'password_reset',
            performedBy: user._id,
            role: user.role,
            targetResource: 'user',
            targetId: user._id,
            ipAddress: req.ip,
            timestamp: new Date(),
            details: `Password reset for ${user.username}`,
        });

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        logger.error(`Password reset error: ${error.message}`);
        res.status(500).json({ message: 'Password reset failed', error: error.message });
    }
};

exports.logout = (req, res) => {
    // Client-side should discard token
    // Log logout
   
    res.json({ message: 'Logged out successfully' });
};