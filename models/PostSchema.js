const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['like', 'celebrate', 'support'], default: 'like' },
    createdAt: { type: Date, default: Date.now },
});

const commentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
});

const postSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true }, // Text, image URLs, etc.
    college: { type: String, trim: true }, // Optional, for college-specific posts
    targetRoles: [{ type: String, enum: ['student', 'staff', 'alumni', 'admin'] }], // Optional
    tags: [{ type: String, trim: true }], // e.g., ["AI", "event"]
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reactions: [reactionSchema],
    comments: [commentSchema],
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Post', postSchema);