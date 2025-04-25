const mongoose = require('mongoose');

const JobOpportunitySchema = new mongoose.Schema({
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String },
    link: { type: String },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    tags: [{ type: String }],
    visibleTo: [{ type: String, enum: ['alumni', 'student', 'staff'] }],
    isActive: { type: Boolean, default: true },
    postedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date }
  });

module.exports = mongoose.model('JobOpportunity', JobOpportunitySchema);

