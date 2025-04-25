// // Emergency Contact Schema (Complete & Final Version)
// const mongoose = require('mongoose');

// const EmergencyContactSchema = new mongoose.Schema({
//   title: { type: String, required: true }, // e.g. "Campus Security", "Dean of Students"
//   department: { type: String },
//   phone: { type: String, required: true },
//   email: { type: String },
//   location: { type: String }, // e.g. "Block A, Ground Floor"
//   priority: { type: Number, default: 1 }, // lower number = higher priority
//   visibleTo: [{
//     type: String,
//     enum: ['student', 'staff', 'alumni', 'visitor']
//   }],
//   createdAt: { type: Date, default: Date.now },
//   updatedAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model('EmergencyContact', EmergencyContactSchema);
