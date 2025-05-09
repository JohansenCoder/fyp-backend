// src/models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    mentorship: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentorship', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Student or alumni
    content: { type: String, required: true, trim: true }, // e.g., "Can we discuss career paths?"
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);