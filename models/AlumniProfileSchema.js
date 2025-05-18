// Alumni Profile Schema (Complete & Final Version)
const { appCheck } = require('firebase-admin');
const mongoose = require('mongoose');

const AlumniProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  graduationYear: { type: Number, required: true },
  industry: { type: String },
  skills: [{ type: String }],
  achievements: [{ type: String }],
  company: { type: String },
  position: { type: String },
  linkedIn: { type: String },
  bio: { type: String },
  isVerified: { type: Boolean, default: false },
  joinedMentorship: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AlumniProfile', AlumniProfileSchema);
