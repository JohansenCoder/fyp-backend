// News Schema (Complete & Final Version)
const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: {
    type: String,
    enum:['sports', 'technology', 'health', 'academics', 'alumni', 'students life', 'Career fair'],
    required: true
  },
  attachments: [{
    type: String // URL of media (image, video, PDF, etc.)
  }],
  tags: [{ type: String }],
  targetRoles: [{
    type: String,
    enum: ['student', 'visitor', 'alumni'],
    required: true
  }],
  college: [{ type: String, required: true }], // e.g., "CoICT", "CEES"
  isPublished: { type: Boolean, default: true },
  isArchived: { type: Boolean, default: false },
  scheduledAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('News', NewsSchema);
