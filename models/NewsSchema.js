// News Schema (Complete & Final Version)
const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
  headline: { type: String, required: true },
  content: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: {
    type: String,
    enum:['sports', 'technology', 'health', 'academics', 'alumni', 'students_life', 'external_partnerships'],
    required: true
  },
  attachments: [{
    type: String // URL of media (image, video, PDF, etc.)
  }],
  tags: [{ type: String }],
  targetRoles: [{
    type: String,
    enum: ['student', 'staff', 'alumni']
  }],
  collegeScope: [{ type: String }],
  isPublished: { type: Boolean, default: true },
  isArchived: { type: Boolean, default: false },
  scheduledAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('News', NewsSchema);
