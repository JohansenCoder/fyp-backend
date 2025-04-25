const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    // The recipient of the notification
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
    // The title shown in the push or in-app alert
    title: { type: String, required: true },
  
    // The body content of the notification
    body: { type: String, required: true },
  
    // Type of the content the notification is linked to
    sourceType: {
      type: String,
      enum: ['announcement', 'news', 'event'],
      required: true
    },
  
    // Reference to the source document ID (announcement/news/event)
    sourceId: { type: mongoose.Schema.Types.ObjectId, required: true },
  
    // Whether or not the user has seen or interacted with the notification
    seen: { type: Boolean, default: false },
  
    // Whether the notification has been delivered via push/email/etc.
    deliveredVia: [{
      type: String,
      enum: ['push', 'email', 'in-app']
    }],
  
    // Timestamp of when the notification was created or sent
    sentAt: { type: Date, default: Date.now },
  
    // Optional expiration date for temporary notifications
    expiresAt: { type: Date }
  });

module.exports = mongoose.model('Notification', NotificationSchema);

