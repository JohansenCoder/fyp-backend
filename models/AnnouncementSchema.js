// // Announcement Schema (Complete & Final Version)
// const mongoose = require('mongoose');

// const AnnouncementSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   message: { type: String, required: true },
//   createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   targetRoles: [{
//     type: String,
//     enum: ['student', 'staff', 'alumni', 'visitor']
//   }],
//   targetFaculties: [{ type: String }],
//   location: {
//     coordinates: {
//       type: [Number], // [longitude, latitude]
//       index: '2dsphere'
//     },
//     radius: { type: Number } // in meters
//   },
//   type: {
//     type: String,
//     enum: ['emergency', 'academic', 'general', 'opportunity', 'event'],
//     default: 'general'
//   },
//   isScheduled: { type: Boolean, default: false },
//   scheduledAt: { type: Date },
//   expiresAt: { type: Date, required: true },
//   isPublished: { type: Boolean, default: true },
//   visibility: {
//     type: String,
//     enum: ['public', 'private'],
//     default: 'public'
//   },
//   tags: [{ type: String }],
//   createdAt: { type: Date, default: Date.now },
//   updatedAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model('Announcement', AnnouncementSchema);
