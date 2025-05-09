const mongoose = require('mongoose');

const JobOpportunitySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true }, // e.g., "Lecturer in Computer Science"
  description: { type: String, required: true, trim: true }, // e.g., "Full-time position..."
  college: { type: String, trim: true }, // e.g., "CoICT"
  department: { type: String, trim: true }, // e.g., "Computer Science"
  tags: [{ type: String, trim: true }], // e.g., ["AI", "teaching"]
  applicationLink: { type: String, trim: true }, // e.g., "https://udsm.ac.tz/apply"
  deadline: { type: Date }, // e.g., "2025-06-01"
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Admin
  createdAt: { type: Date, default: Date.now }
  });

module.exports = mongoose.model('JobOpportunity', JobOpportunitySchema);

