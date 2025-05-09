const mongoose = require('mongoose');

const MentorshipRequestSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    alumniId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String }, // Optional message from the student
    status: { type: String, enum: ['pending', 'approved', 'declined'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });

module.exports = mongoose.model('MentorshipRequest', MentorshipRequestSchema);

