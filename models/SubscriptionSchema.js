// Subscription Schema (Complete & Final Version)
const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'DynamicEvent', required: true },
  eventType: { type: String }, // e.g., "webinar", "social"
  college: { type: String }, // Optional, for college-specific subscriptions
  subscribedAt: { type: Date, default: Date.now },
  reminderSent: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['subscribed', 'Unsubscribed', 'Pending'],
    default: 'subscribed'
  }
});
// unique index to prevent duplicate subscriptions
SubscriptionSchema.index({ userId: 1, eventId: 1 }, { unique: true });

module.exports = mongoose.model('Subscription', SubscriptionSchema);

