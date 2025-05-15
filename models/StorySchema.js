const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
    content: { type: String, required: true, trim: true }, // e.g., image URL, video URL, or text
    college: { type: String, required: true, trim: true }, // e.g., "CoICT"
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now, expires: '24h' }, // Auto-delete after 24 hours
    viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Track who viewed
});

module.exports = mongoose.model('Story', storySchema);