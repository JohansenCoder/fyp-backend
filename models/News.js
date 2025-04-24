const mongoose = require("mongoose");

const NewsSchema = new mongoose.Schema({
  headline: { type: String, required: true },
  body: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  category: { type: String }, // e.g., academics, sports, alumni, etc.
  attachments: [{ type: String }], // URLs to images, videos
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  visibleTo: [{ type: String, enum: ["student", "staff", "alumni"] }],
  facultyScope: [{ type: String }], // e.g., ["COICT"], or "All"
  isPublished: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false },
  scheduledAt: { type: Date }
});

module.exports = mongoose.model("News", NewsSchema);
