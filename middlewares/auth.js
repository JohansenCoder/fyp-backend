// middleware/auth.js
const jwt = require('jsonwebtoken');

// Verify JWT token
exports.authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach userId, role, etc.
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Restrict to admins
exports.restrictToAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

// Restrict to organizers or admins
exports.restrictToOrganizer = (req, res, next) => {
    if (!['organizer', 'admin'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Organizer or admin access required' });
    }
    next();
};

// Restrict to alumni
exports.restrictToAlumni = (req, res, next) => {
    if (req.user.role !== 'alumni') {
        return res.status(403).json({ error: 'Alumni access required' });
    }
    next();
};
// Restrict to students
exports.restrictToStudent = (req, res, next) => {
    if (req.user.role !== 'student') {
        return res.status(403).json({ error: 'Student access required' });
    }
    next();
};