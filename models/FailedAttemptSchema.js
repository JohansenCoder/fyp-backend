const mongoose = require('mongoose');

const failedAttemptSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    attempts: { type: Number, default: 0 },
    lastAttempt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('FailedAttempt', failedAttemptSchema);