const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true, trim: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetRoles: [{
    type: String,
    enum: ['student', 'alumni', 'visitor'],
    required: true
  }],
  college: [{ type: String, required: true }], // e.g., "CoICT", "CEES"
  location: {
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    },
    radius: { type: Number } // in meters
  },
  category: {
    type: String,
    enum: ['emergency', 'academic', 'general', 'opportunity', 'event'],
    default: 'general'
  },
  isScheduled: { type: Boolean, default: false },
  scheduledAt: { type: Date },
  expiresAt: {
    type: Date,
    required: true,
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Expiration date must be in the future'
    }
  },
  isPublished: { type: Boolean, default: true },
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  tags: [{ type: String, trim: true }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update updatedAt on document update
AnnouncementSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

module.exports = mongoose.model('Announcement', AnnouncementSchema);