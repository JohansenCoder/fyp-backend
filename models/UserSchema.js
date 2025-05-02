// src/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true }, // Hashed
    role: { type: String, enum: ['student', 'staff', 'alumni', 'admin'], required: true },
    college: { type: String, required: true }, // e.g., "CoICT", "MCHAS"
    profile: {
        firstName: { type: String },
        lastName: { type: String },
        department: { type: String }, // For students/staff
        graduationYear: { type: Number }, // For alumni
        phone: { type: String },
        faculty: { type: String }, // For faculty-specific admins
    },
    token: { type: String }, // Added token field
    interests: [String], // e.g., ["webinars", "hackathons"]
    notificationPreferences: {
        newEvents: { type: Boolean, default: true },
        reminders: { type: Boolean, default: true },
        cancellations: { type: Boolean, default: true }
    },
    fcmToken: { type: String }, // Firebase Cloud Messaging token
    lastActive: { type: Date, default: Date.now }, // For session timeout
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);