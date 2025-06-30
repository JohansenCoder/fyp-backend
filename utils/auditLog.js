const AuditLogSchema = require('../models/AuditLogSchema');
const winston = require('winston');

const logger = winston.createLogger({
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/admin-activities.log' }),
    ],
});

const logAdminAction = async ({ admin, action, targetResource, targetId, details, ipAddress, performedBy }) => {
    try {
        if (!performedBy) {
            throw new Error('performedBy is required');
        }
        if (!targetId) {
            throw new Error('targetId is required');
        }
        const log = new AuditLogSchema({
            action,
            performedBy,
            role: admin.role,
            targetResource,
            targetId,
            details: JSON.stringify(details || {}),
            ipAddress,
        });
        await log.save();
        logger.info(`Audit log created: ${action} by ${admin.username} on ${targetResource}:${targetId}`);
        return log._id;
    } catch (error) {
        logger.error(`Audit log error: ${error.message}`);
    }
};

module.exports = { logAdminAction };