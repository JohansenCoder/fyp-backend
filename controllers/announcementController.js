const Announcement = require('../models/AnnouncementSchema');
const { validate } = require('../models/FailedAttemptSchema');
const User = require('../models/UserSchema');
const { notifyAnnouncement, notifyAdminAction } = require('../services/notificationService');    
const {logAdminAction} = require('../utils/auditLog');


// create announcement (admin only)
exports.createAnnouncement = async (req, res) => {
    // Validate the request body
    validate([
        body('title').notEmpty().trim(),
        body('content').notEmpty().trim(),
        body('createdBy').notEmpty().trim(),
        body('targetRoles').optional().isArray(),
        body('collegeScope').optional().isArray(),
        body('category').optional().isString(),
        body('isScheduled').optional().isBoolean(),
        body('location').optional().isObject(),
        body('location.coordinates').optional().isArray(),
        body('location.radius').optional().isNumeric(),
        body('scheduledAt').optional().isDate(),
        body('tags').optional().isArray(),
        body('isPublished').optional().isBoolean()
    ])
    try {
        const announcement = await Announcement.create(req.body);

        const logId = await logAdminAction({
            admin: req.user,
            action: 'announcement_created',
            targetResource: 'announcement',
            targetId: announcement._id,
            details: { title: announcement.title, college: announcement.college },
            ipAddress: req.ip,
        });

        await notifyAnnouncement(announcement);
        // Notify admin about the announcement creation
        await notifyAdminAction({
            college: announcement.college,
            message: `Announcement "${announcement.title}" created`,
            actionType: 'Announcement Creation',
            logId,
        });
        // Notify users about the announcement
        await notifyAnnouncement(announcement);
        return res.status(201).json({
            message: "Announcement created successfully",
            announcement: announcement
        });
    } catch (err) {
        return res.status(500).json({ message: "Error creating announcement", error: err.message });
    }
}

// get all announcements 
exports.getAllAnnouncements = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);

        if(!user) return res.status(404).json({ message: "User not Found."})
        const query = {
            isPublished: true,
            $or: [
                { collegeScope: { $in: [user.college] } },
                { tags: { $in: user.interests } }
            ]
        };
        const announcements = await Announcement.find(query);
        res.status(200).json({
            message: "Announcements fetched successfully",
            announcements: announcements
        });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching announcements", error: error.message });
    }
}



exports.getAnnouncementById = async (req, res) => {
   try {
    const { id } = req.params;
    const announcement = await Announcement.findById(id);
    if (!announcement) {
        return res.status(404).json({ message: "Announcement not found" });
    }
    res.status(200).json({
        message: "Announcement fetched successfully",
        announcement: announcement
    }); 
   }
   catch (error) {
    return res.status(500).json({ message: "Error fetching announcement", error: error.message });
   }
}

// update announcement (admin only)
exports.updateAnnouncement = async (req, res) => {
    // Validate the request body
    validate([
        body('title').optional().notEmpty().trim(),
        body('content').optional().notEmpty().trim(),
        body('createdBy').optional().notEmpty().trim(),
        body('targetRoles').optional().isArray(),
        body('collegeScope').optional().isArray(),
        body('category').optional().isString(),
        body('isScheduled').optional().isBoolean(),
        body('location').optional().isObject(),
        body('location.coordinates').optional().isArray(),
        body('location.radius').optional().isNumeric(),
        body('scheduledAt').optional().isDate(),
        body('tags').optional().isArray(),
        body('isPublished').optional().isBoolean()
    ])
    try{
        const { id } = req.params;
    const announcement = await Announcement.findById(id);
    if (!announcement) {
        return res.status(404).json({ message: "Announcement not found" });
    }
    await Announcement.findByIdAndUpdate(id, req.body);
    const logId = await logAdminAction({
        admin: req.user,
        action: 'announcement_updated',
        targetResource: 'announcement',
        targetId: announcement._id,
        details: { title: announcement.title, updates: req.body },
        ipAddress: req.ip,
    });

    await notifyAdminAction({
        college: announcement.college,
        message: `Announcement "${announcement.title}" updated`,
        actionType: 'Announcement Update',
        logId,
    });
    res.status(200).json({ message: "Announcement updated successfully" });
    }
    catch (err) {
        return res.status(500).json({ message: "Error updating announcement", error: err.message });
    }
}

exports.deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
    const announcement = await Announcement.findById(id);
    if (!announcement) {
        return res.status(404).json({ message: "Announcement not found" });
    }   
    await Announcement.findByIdAndDelete(id);

    const logId = await logAdminAction({
        admin: req.user,
        action: 'announcement_deleted',
        targetResource: 'announcement',
        targetId: req.params.id,
        details: { title: announcement.title },
        ipAddress: req.ip,
    });

    await notifyAdminAction({
        college: announcement.college,
        message: `Announcement "${announcement.title}" deleted`,
        actionType: 'Announcement Deletion',
        logId,
    });
    res.status(200).json({ message: "Announcement deleted successfully" });
    }
    catch (err) {
        return res.status(500).json({ message: "Error deleting announcement", error: err.message });
    }
}





