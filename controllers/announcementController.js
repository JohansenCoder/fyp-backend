const Announcement = require('../models/AnnouncementSchema');
const User = require('../models/UserSchema');
const { notifyAnnouncement, notifyAdminAction } = require('../services/notificationService');
const { logAdminAction } = require('../utils/auditLog');

exports.createAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.create({
      ...req.body,
      createdBy: req.user.id
    });

    const logId = await logAdminAction({
      admin: req.user,
      action: 'announcement_created',
      targetResource: 'announcement',
      targetId: announcement._id,
      details: { title: announcement.title, college: announcement.college },
      ipAddress: req.ip,
    });

    await notifyAnnouncement(announcement);
    await notifyAdminAction({
      college: announcement.college,
      message: `Announcement "${announcement.title}" created`,
      actionType: 'Announcement Creation',
      logId,
    });

    return res.status(201).json({
      message: "Announcement created successfully",
      announcement
    });
  } catch (err) {
    return res.status(500).json({ message: "Error creating announcement", error: err.message });
  }
};

exports.getAllAnnouncements = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    let query = {
      
      expiresAt: { $gt: new Date() } // Only active announcements
    };

    // If user is not an admin, apply filtering based on role, college, location, and visibility
    if (user.role === 'college_admin') {
      query = {
        ...query,
        college: user.college
      };
    } else if (user.role !== 'system_admin') {
      query = {
        ...query,
        $or: [
          // Role and college-based announcements
          {
            targetRoles: user.role,
            college: { $in: [user.college] }
          },
          // Emergency announcements based on location
          {
            category: 'emergency',
            'location.coordinates': {
              $geoWithin: {
                $centerSphere: [
                  user.location?.coordinates || [0, 0], // [longitude, latitude]
                  (user.location?.radius || 1000) / 6378100 // Default 1km radius, converted to radians
                ]
              }
            }
          },
          // Public announcements matching user interests
          {
            visibility: 'public',
            tags: { $in: user.interests || [] }
          }
        ]
      };
    }

    const announcements = await Announcement.find(query)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Announcements fetched successfully",
      announcements
    });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching announcements", error: error.message });
  }
};

exports.getAnnouncementById = async (req, res) => {
  try {
    const { id } = req.params;
    const announcement = await Announcement.findById(id).populate('createdBy', 'name');
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }
    res.status(200).json({
      message: "Announcement fetched successfully",
      announcement
    });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching announcement", error: error.message });
  }
};

exports.updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }
    const updatedAnnouncement = await Announcement.findByIdAndUpdate(id, {
      ...req.body,
      updatedAt: new Date()
    }, { new: true });

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

    res.status(200).json({
      message: "Announcement updated successfully",
      announcement: updatedAnnouncement
    });
  } catch (err) {
    return res.status(500).json({ message: "Error updating announcement", error: err.message });
  }
};

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
      targetId: id,
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
  } catch (err) {
    return res.status(500).json({ message: "Error deleting announcement", error: err.message });
  }
};