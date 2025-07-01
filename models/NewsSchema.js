const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: {
    type: String,
    enum: ['sports', 'technology', 'health', 'academics', 'alumni', 'students_life', 'career_fair'],
    required: true
  },
  media: [{
    url: { type: String, required: true },
    type: { type: String, enum: ['image', 'video'], required: true }
  }],
  tags: [{ type: String }],
  targetRoles: [{
    type: String,
    enum: ['student', 'visitor', 'alumni'],
    required: true
  }],
  college: [{ type: String, required: true }],
  isPublished: { type: Boolean, default: true },
  isArchived: { type: Boolean, default: false },
  scheduledAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('News', NewsSchema);