const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  // Core user fields
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true }, // Hashed
  role: {
    type: String,
    enum: ["student", "visitor", "alumni", "college_admin", "system_admin"],
    required: true,
  },
  college: {
    type: String,
   
     function () {
      if(this.role==="college_admin" || this.role === "student"|| this.role === "alumni") {
        return true;
      }
      return false;
    },
  }, // e.g., "CoICT", "MCHAS"

  // Profile details
  profile: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    department: { type: String },
    graduationYear: { type: Number},
    registrationNumber: { type: String}, // Optional for visitors
    location: {
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    },
    radius: { type: Number, default: 1000 } // Default 1km radius
  },
    phone: { type: String },
    bio: { type: String },
    profilePicture: { type: String },
    mentorshipAvailability: { 
      type: Boolean, 
      default: false,
      required: 
      function () {
       if(this.role==="alumni"){
          return true;
       }
      },
    },
    // Notification preferences
  notificationPreferences: {
    events: { type: Boolean, default: true },
    news: { type: Boolean, default: true },
    announcements: { type: Boolean, default: true },
    mentorship: { type: Boolean, default: true },
    opportunities: { type: Boolean, default: true },
    social: { type: Boolean, default: true },
  },
  // Education history
  education: [
    {
      degreeCourse: { type: String },
      startYear: { type: Number },
      endYear: { type: Number },
      college: { type: String },
    },
  ],

    // Work history
  workExperience: [
    {
      company: { type: String },
      jobTitle: { type: String },
      industry: { type: String },
      startDate: { type: Date },
      endDate: { type: Date },
      current: { type: Boolean, default: false },
    },
  ],

  // Skills and expertise
  expertise: [
    {
      name: { type: String },
      proficiency: { type: Number, min: 1, max: 5, default: 3 },
    },
  ],

  // Achievements
  achievements: [
    {
      title: { type: String },
      description: { type: String },
      date: { type: Date },
    },
  ],

  // Interests
  interests: [String],

  // Social content
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
  
  },

  // Authentication and notifications
  token: { type: String },
  fcmTokens: [{ type: String }],

  

  // User activity tracking
  lastActive: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },

  // Relationships
  relationships: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      type: { type: String, enum: ["connected", "following"], default: "following" },
    },
  ],

  



  // Add to your UserSchema.js
studentEngagement: {
  postsCreated: { type: Number, default: 0 },
  alumniConnections: { type: Number, default: 0 },
  eventsRegistered: { type: Number, default: 0 },
  eventsAttended: { type: Number, default: 0 },
  mentorshipRequests: { type: Number, default: 0 },
  activeMentorships: { type: Number, default: 0 },
  lastEngagementDate: { type: Date }
},

alumniEngagement: {
  postsCreated: { type: Number, default: 0 },
  eventsRegistered: { type: Number, default: 0 },
  eventsAttended: { type: Number, default: 0 },
  menteesCount: { type: Number, default: 0 },
  careerAdviceSessions: { type: Number, default: 0 },
  networkingEvents: { type: Number, default: 0 },
  lastEngagementDate: { type: Date }
},

systemAdminEngagement: {
  eventsCreated: { type: Number, default: 0 },
  announcementsCreated: { type: Number, default: 0 },
  usersManaged: { type: Number, default: 0 },
  systemActions: { type: Number, default: 0 },
  lastEngagementDate: { type: Date }
},

collegeAdminEngagement: {
  eventsCreated: { type: Number, default: 0 },
  announcementsCreated: { type: Number, default: 0 },
  collegeUsersManaged: { type: Number, default: 0 },
  collegeActions: { type: Number, default: 0 },
  lastEngagementDate: { type: Date }
},
});

module.exports = mongoose.model("User", userSchema);