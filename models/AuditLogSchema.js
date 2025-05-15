const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    action: { type: String, required: true }, // e.g., 'user_created', 'role_updated'
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['college_admin', 'system_admin'], required: true },
    targetResource: { type: String, required: true }, // e.g., 'user', 'post'
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true }, // ID of the affected resource
    details: { type: String },
    ipAddress: { type: String }, // IP address of the user performing the action
    timestamp: { type: Date, default: Date.now },
});

// Indexes for performance
auditLogSchema.index({ performedBy: 1, timestamp: -1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ targetResource: 1, targetId: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);