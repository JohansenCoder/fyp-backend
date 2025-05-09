const mongoose = require('mongoose');

const dynamicEventSchema = new mongoose.Schema({
    title: { type: String, required: true }, // e.g., "AI Workshop"
    description: { type: String, required: true },
    category: { type: String, enum: ['workshop', 'seminar', 'conference', 'webinar'], required: true },
    imageUrl: { type: String }, // URL to the event image
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // List of attendees
    maxAttendees: { type: Number }, // Optional, max number of attendees
    registrationLink: { type: String }, // Optional, link for registration
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