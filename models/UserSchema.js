// const mongoose = require('mongoose');

// const UserSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: {
//     type: String,
//     required: function () {
//       return this.role !== 'visitor';
//     },
//     unique: true
//   },
//   password: {
//     type: String,
//     required: function () {
//       return ['alumni', 'admin'].includes(this.role);
//     },
//     select: false // hide password on default queries
//   },
//   role: {
//     type: String,
//     enum: ['student', 'staff', 'alumni', 'admin', 'visitor'],
//     required: true
//   },
//   faculty: {
//     type: String // e.g., COICT, Law, etc.
//   },
//   department: {
//     type: String // optional
//   },
//   deviceToken: {
//     type: String // for FCM
//   },
//   location: {
//     coordinates: {
//       type: [Number], // [longitude, latitude]
//       index: '2dsphere'
//     },
//     updatedAt: Date
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   },
//   alumniDetails: {
//     graduationYear: Number,
//     industry: String,
//     company: String,
//     linkedIn: String,
//     isVerified: Boolean
//   },
//   isAdmin: {
//     type: Boolean,
//     default: false
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   }
// });

// module.exports = mongoose.model('User', UserSchema);
