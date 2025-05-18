const mongoose = require('mongoose');

const dynamicEventSchema = new mongoose.Schema({
    title: { type: String, required: true }, // e.g., "AI Workshop"
    description: { type: String, required: true },
    category: { type: String, enum: ['workshop', 'seminar', 'conference', 'webinar'], required: true },
    imageUrl: { type: String }, // URL to the event image
    maxAttendees: { type: Number }, // Optional, max number of attendees
    registrationLink: { type: String }, // Optional, link for registration
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    startTime: { type: String, required: true }, // e.g., "10:00 AM"
    endTime: { type: String, required: true }, // e.g., "12:00 PM"
    college: [{ type: String }], // e.g., ["CoICT", "CoET"]
    department: [{ type: String }], // Optional
    tags: [{ type: String }], // e.g., ["webinar", "tech"]
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // User ID of the creator
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    location: { type: String },
    status: { type: String, enum: ['active', 'cancelled'], default: 'active' }
});

module.exports = mongoose.model('DynamicEvent', dynamicEventSchema);