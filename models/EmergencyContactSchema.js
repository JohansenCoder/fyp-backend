// Emergency Contact Schema (Complete & Final Version)
const mongoose = require('mongoose');

const EmergencyContactSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. "Campus Security", "Dean of Students"
  phone: { type: String, trim:true, required: true },
  category: { type: String, enum: ['Medical', 'Security', 'Fire', 'Counseling'], required: true },
  description: { type: String, trim: true }, // e.g., "24/7 campus security hotline"
  location: { type: String }, // e.g. "Block A, Ground Floor"
  priority: { type: Number, default: 1 }, // lower number = higher priority
  visibleTo: [{
    type: String,
    enum: ['student', 'staff', 'alumni', 'visitor']
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('EmergencyContact', EmergencyContactSchema);
