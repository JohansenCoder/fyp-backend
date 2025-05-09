const Announcement = require('../models/AnnouncementSchema');
const { validate } = require('../models/FailedAttemptSchema');
const User = require('../models/UserSchema');
const { notifyAnnouncement } = require('../services/notificationService');    


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
    const { id } = req.params;
    const announcement = await Announcement.findById(id);
    if (!announcement) {
        return res.status(404).json({ message: "Announcement not found" });
    }
    await Announcement.findByIdAndUpdate(id, req.body);
    res.status(200).json({ message: "Announcement updated successfully" });
}

exports.deleteAnnouncement = async (req, res) => {
    const { id } = req.params;
    const announcement = await Announcement.findById(id);
    if (!announcement) {
        return res.status(404).json({ message: "Announcement not found" });
    }   
    await Announcement.findByIdAndDelete(id);
    res.status(200).json({ message: "Announcement deleted successfully" });
}





