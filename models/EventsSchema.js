// // Event Schema (Complete & Final Version)
// const mongoose = require('mongoose');

// const EventSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   description: { type: String, required: true },
//   location: { type: String, required: true },
//   category: {
//     type: String,
//     enum: ['academic', 'club', 'alumni', 'external', 'recreational'],
//     required: true
//   },
//   startTime: { type: Date, required: true },
//   endTime: { type: Date },
//   createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   faculty: { type: String },
//   targetRoles: [{
//     type: String,
//     enum: ['student', 'staff', 'alumni']
//   }],
//   tags: [{ type: String }],
//   attachments: [{ type: String }], // e.g., flyers, brochures
//   isPublished: { type: Boolean, default: true },
//   isCancelled: { type: Boolean, default: false },
//   createdAt: { type: Date, default: Date.now },
//   updatedAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model('Event', EventSchema);
