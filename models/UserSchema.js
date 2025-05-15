// src/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true }, // Hashed
    role: { type: String, enum: ['student', 'staff', 'alumni', 'college_admin', 'system_admin'], required: true },
    college: { type: String, required: function () {
        return this.role === 'college_admin' || this.role === 'student';
    }, }, // e.g., "CoICT", "MCHAS"
    profile: {
        firstName: { type: String },
        lastName: { type: String },
        department: { type: String }, // For students/staff
        graduationYear: { type: Number }, // For alumni
        industry: { type: String }, // e.g., "Technology" (for alumni)
        expertise: [{ type: String }], // e.g., ["AI", "Software Engineering"] (for alumni)
        company: { type: String }, // e.g., "Google" (for alumni)
        jobTitle: { type: String }, // e.g., "Senior Engineer" (for alumni)
        mentorshipAvailability: { type: Boolean, default: false }, // For alumni
        location: { type: String }, // e.g., "Dar es Salaam"
        phone: { type: String },
        bio: { type: String }, // Short biography
        profilePicture: { type: String }, // URL to the profile picture
    },
    token: { type: String }, // Added token field
    interests: [String], // e.g., ["webinars", "hackathons"]
    notificationPreferences: {
        newEvents: { type: Boolean, default: true },
        cancellations: { type: Boolean, default: true },
        reminders: { type: Boolean, default: true },
        news: { type: Boolean, default: true },
        announcements: { type: Boolean, default: true },
        jobs: { type: Boolean, default: true }, 
        mentorship: { type: Boolean, default: true },
        stories: { type: Boolean, default: true },
        posts: { type: Boolean, default: true },
        adminActions: { type: Boolean, default: true }, // For admin notifications
    },
    fcmTokens: [{ type: String }], // Multiple device support
    lastActive: { type: Date, default: Date.now }, // For session timeout
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);