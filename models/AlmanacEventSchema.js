const mongoose = require('mongoose');

const almanacEventSchema = new mongoose.Schema({
    title: { type: String, required: true }, // e.g., "Semester I Examinations"
    description: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    college: { type: String, required: true }, // e.g., "All", "MCHAS"
    eventType: { type: String, required: true }, // e.g., "Examinations", "Graduation"
    location: { type: String }
});

module.exports = mongoose.model('AlmanacEvent', almanacEventSchema);