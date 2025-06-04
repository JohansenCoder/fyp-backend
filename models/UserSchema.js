// src/models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true }, // Hashed
  role: {
    type: String,
    enum: ["student", "staff", "alumni", "college_admin", "system_admin"],
    required: true,
  },
  college: {
    type: String,
    required: function () {
      return this.role === "college_admin" || this.role === "student";
    },
  }, // e.g., "CoICT", "MCHAS"
  profile: {
    firstName: { type: String },
    lastName: { type: String },
    department: { type: String }, // For students/staff
    graduationYear: { type: Number }, // For alumni
    industry: { type: String }, // e.g., "Technology" (for alumni)
    expertise: [
      {
        name: { type: String, required: true },
        proficiency: { type: Number, min: 1, max: 5, default: 3 },
      },
    ], // Skills with proficiency
    company: { type: String }, // e.g., "Google" (for alumni)
    jobTitle: { type: String }, // e.g., "Senior Engineer" (for alumni)
    mentorshipAvailability: { type: Boolean, default: false }, // For alumni
    location: { type: String }, // e.g., "Dar es Salaam"
    phone: { type: String },
    bio: { type: String }, // Short biography
    profilePicture: { type: String }, // URL to the profile picture
    achievements: [
      {
        title: { type: String, required: true },
        description: { type: String },
        date: { type: Date },
      },
    ], // User achievements
  },
  token: { type: String }, // Added token field
  interests: [String], // e.g., ["webinars", "hackathons"]
  notificationPreferences: {
    newEvents: { type: Boolean, default: true },
    cancellations: { type: Boolean, default: true },
    reminders: { type: Boolean, default: true },
    news: { type: Boolean, default: true },
    announcements: { type: Boolean, default: true },
    jobs: { type: Boolean, default: true },
    mentorship: { type: Boolean, default: true },
    stories: { type: Boolean, default: true },
    posts: { type: Boolean, default: true },
    adminActions: { type: Boolean, default: true }, // For admin notifications
  },
  fcmTokens: [{ type: String, required: true }], // Multiple device support
  lastActive: { type: Date, default: Date.now }, // For session timeout
  createdAt: { type: Date, default: Date.now },
  connections: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Linked users
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Users being followed
  education: [
    {
      degree: { type: String }, // e.g., "BSc Computer Science"
      institution: { type: String }, // e.g., "UDSM"
      startYear: { type: Number },
      endYear: { type: Number },
    },
  ],
  workExperience: [
    {
      company: { type: String },
      jobTitle: { type: String },
      startDate: { type: Date },
      endDate: { type: Date },
      current: { type: Boolean, default: false },
    },  ],
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }], // Reference to posts
  
  // Student engagement tracking (for students only)
  studentEngagement: {
    postsCreated: { type: Number, default: 0 }, // Number of posts created by student
    alumniConnections: { type: Number, default: 0 }, // Number of connections made with alumni
    eventsRegistered: { type: Number, default: 0 }, // Number of events registered for
    eventsAttended: { type: Number, default: 0 }, // Number of events actually attended
    mentorshipRequests: { type: Number, default: 0 }, // Number of mentorship requests made
    activeMentorships: { type: Number, default: 0 }, // Number of active mentorships
    lastEngagementDate: { type: Date }, // Last time student engaged with platform
  },
});

module.exports = mongoose.model("User", userSchema);