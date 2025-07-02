const mongoose = require('mongoose');

const dynamicEventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['workshop', 'seminar', 'conference', 'webinar'], required: true },
  organizer: { type: String, required: true },
  contactEmail: { type: String }, // Use String for email
  contactPhone: { type: String}, // Use String for phone number
  date: { type: Date }, // Use Date type for date
  targetRoles: [
    { type: String, enum: ['student', 'visitor', 'alumni'], required: true },
  ],
  startTime: { type: String}, // Use String for time (HH:mm format)
   // Use String for time (HH:mm format)
    media: [
      {
      url: { type: String, required: true }, // URL from Cloudinary or similar service
        type: { type: String, enum: ['image', 'video'], required: true }, // Media type
      },
    ],
    maxAttendees: { type: Number, required: true },
  // Change this from Number to array of user references
  Attendees: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'

  }],
  registrationLink: { type: String },
  college: [{ type: String }],
  department: [{ type: String }],
  tags: [{ type: String }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  location: { type: String },
  status: { type: String, enum: ['active', 'cancelled','completed'], default: 'active' },
});

module.exports = mongoose.model('DynamicEvent', dynamicEventSchema);