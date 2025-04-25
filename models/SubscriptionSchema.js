// // Subscription Schema (Complete & Final Version)
// const mongoose = require('mongoose');

// const SubscriptionSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
//   subscribedAt: { type: Date, default: Date.now },
//   reminderSent: { type: Boolean, default: false },
//   status: {
//     type: String,
//     enum: ['subscribed', 'cancelled'],
//     default: 'subscribed'
//   }
// });

// module.exports = mongoose.model('Subscription', SubscriptionSchema);
