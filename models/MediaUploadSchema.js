const mongoose = require('mongoose');

const MediaUploadSchema = new mongoose.Schema({
    url: { type: String, required: true },
    type: { type: String, enum: ['image', 'video', 'document'], required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    linkedTo: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'linkedModel'
    },
    linkedModel: {
      type: String,
      enum: ['Announcement', 'News', 'Event'],
      required: true
    },
    uploadedAt: { type: Date, default: Date.now }
  });
  
  // Relevance:
  // Tracks uploaded media used in announcements, news, and events.
  // Facilitates media management, auditability, and scalable storage references.

module.exports = mongoose.model('MediaUpload', MediaUploadSchema);
