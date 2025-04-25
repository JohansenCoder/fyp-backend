// const Announcement = require('../models/AnnouncementSchema');


// exports.getAllAnnouncements = async (req, res) => {
//     try {
//         const announcements = await Announcement.find();
//         res.status(200).json({
//             message: "Announcements fetched successfully",
//             announcements: announcements
//         });
//     } catch (error) {
//         return res.status(500).json({ message: "Error fetching announcements", error: error.message });
//     }
// }

// exports.createAnnouncement = async (req, res) => {
//     try {
//         const announcement = await Announcement.create(req.body);
//         return res.status(201).json({
//             message: "Announcement created successfully",
//             announcement: announcement
//         });
//     } catch (err) {
//         return res.status(500).json({ message: "Error creating announcement", error: err.message });
//     }
// }

// exports.getAnnouncementById = async (req, res) => {
//     const { id } = req.params;
//     const announcement = await Announcement.findById(id);
//     if (!announcement) {
//         return res.status(404).json({ message: "Announcement not found" });
//     }
//     res.status(200).json({
//         message: "Announcement fetched successfully",
//         announcement: announcement
//     }); 
// }

// exports.updateAnnouncement = async (req, res) => {
//     const { id } = req.params;
//     const announcement = await Announcement.findById(id);
//     if (!announcement) {
//         return res.status(404).json({ message: "Announcement not found" });
//     }
//     await Announcement.findByIdAndUpdate(id, req.body);
//     res.status(200).json({ message: "Announcement updated successfully" });
// }

// exports.deleteAnnouncement = async (req, res) => {
//     const { id } = req.params;
//     const announcement = await Announcement.findById(id);
//     if (!announcement) {
//         return res.status(404).json({ message: "Announcement not found" });
//     }   
//     await Announcement.findByIdAndDelete(id);
//     res.status(200).json({ message: "Announcement deleted successfully" });
// }





