const mongoose = require('mongoose');

const dynamicEventSchema = new mongoose.Schema({
    title: { type: String, required: true }, // e.g., "AI Workshop"
    description: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    college: [{ type: String }], // e.g., ["CoICT", "CoET"]
    department: [{ type: String }], // Optional
    tags: [{ type: String }], // e.g., ["webinar", "tech"]
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    location: { type: String },
    status: { type: String, enum: ['active', 'cancelled'], default: 'active' }
});

module.exports = mongoose.model('DynamicEvent', dynamicEventSchema);