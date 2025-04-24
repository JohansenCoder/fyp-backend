const mongoose = require("mongoose");

const AnnouncementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  targetRoles: [{ type: String, enum: ["student", "staff", "alumni", "visitor"] }],
  targetFaculties: [{ type: String }], // e.g., ["COICT", "LAW"]
  location: {
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: "2dsphere"
    },
    radius: Number // meters
  },
  type: { type: String, enum: ["emergency", "academic", "general"], default: "general" },
  isScheduled: { type: Boolean, default: false },
  scheduledAt: { type: Date },
  isPublished: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  visibility: { type: String, enum: ["public", "private"], default: "public" },
  tags: [{ type: String }]
});

module.exports = mongoose.model("Announcement", AnnouncementSchema);
