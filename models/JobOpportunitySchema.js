const mongoose = require('mongoose');

const JobOpportunitySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true }, // e.g., "Lecturer in Computer Science"
  description: { type: String, required: true, trim: true }, // e.g., "Full-time position..."
  company: { type: String, required: true, trim: true }, // e.g., "University of Dar es Salaam"
  location: { type: String, required: true, trim: true }, // e.g
  type: { type: String, enum: ['full-time', 'part-time', 'contract','internship'], required: true }, // e.g., "full-time"
  requirements: [{ type: String, required: true, trim: true }], // e.g., "PhD in Computer Science..."
  responsibilities: [{ type: String, required: true, trim: true }], // e.g
  tags: [{ type: String, trim: true }], // e.g., ["AI", "teaching"]
  applicationLink: { type: String, trim: true }, // e.g., "https://udsm.ac.tz/apply"
  deadline: { type: Date, required:true}, // e.g., "2025-06-01"
  contactEmail: {type: String, required: true, trim: true }, // e.g., "
  contactPhone: { type: String, trim: true }, // e.g., "+255 123 456 789"
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Admin
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'closed'], default: 'active' }
  });

module.exports = mongoose.model('JobOpportunity', JobOpportunitySchema);

