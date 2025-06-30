const mongoose = require('mongoose');


const storySchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true }, // e.g., "My Day at CoICT"
    content: { type: String, required: true, trim: true }, // e.g., image URL, video URL, or text
    college: { type: String, required: true, trim: true }, // e.g., "CoICT"
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
   media: [
    {
      url: { type: String, required: true }, // Cloudinary URL
      type: { type: String, enum: ['image', 'video'], required: true }, // Media type
    },
  ],
    createdAt: { type: Date, default: Date.now, expires: '24h' }, // Auto-delete after 24 hours
    status: {
        type: String,
        enum: ['active', 'deleted'], // 'active' for visible stories, 'deleted' for soft-deleted
        default: 'active',
        required: true,
    },
});

module.exports = mongoose.model('Story', storySchema);