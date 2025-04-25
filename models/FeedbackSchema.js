const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, required: true },
    type: { type: String, enum: ['bug', 'suggestion', 'complaint'], required: true },
    submittedAt: { type: Date, default: Date.now }
  });

module.exports = mongoose.model('Feedback', FeedbackSchema);

