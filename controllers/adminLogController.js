 const AdminLog = require('../models/AdminLogSchema');


 exports.createAdminLog = async (req, res) => {
    try {
        const adminLog = await AdminLog.create(req.body);
        return res.status(201).json({
            message: "Admin log created successfully",
            adminLog: adminLog
        });
    } catch (err) {
        return res.status(500).json({ message: "Error creating admin log", error: err.message });
    }
}

exports.getAllAdminLogs = async (req, res) => {
    try {
        const adminLogs = await AdminLog.find();
        return res.status(200).json({
            message: "Admin logs fetched successfully",
            adminLogs: adminLogs
        });
    } catch (err) {
        return res.status(500).json({ message: "Error fetching admin logs", error: err.message });
    }
}


exports.getAdminLogById = async (req, res) => {
    const { id } = req.params;
    const adminLog = await AdminLog.findById(id);
    if (!adminLog) { 
        return res.status(404).json({ message: "Admin log not found" });
    }
    res.status(200).json({
        message: "Admin log fetched successfully",
        adminLog: adminLog
    }); 
}
