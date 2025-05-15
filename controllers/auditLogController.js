const AuditLog = require('../models/AuditLogSchema');

exports.getAllAuditLogs = async (req, res) => {
    try {
        const AuditLogs = await AuditLog.find();
        return res.status(200).json({
            message: "Admin logs fetched successfully",
            adminLogs: AuditLogs
        });
    } catch (err) {
        return res.status(500).json({ message: "Error fetching audit logs", error: err.message });
    }
}


