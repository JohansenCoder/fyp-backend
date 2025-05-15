const AuditLogSchema = require('../models/AuditLogSchema');
const winston = require('winston');

const logger = winston.createLogger({
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/admin-activities.log' }),
    ],
});

const logAdminAction = async ({ admin, action, targetResource, targetId, details, ipAddress }) => {
    try {
        const log = new AuditLogSchema({
            action,
            performedBy: admin._id,
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