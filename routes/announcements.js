const express = require("express");
const router = express.Router();
const { getAllAnnouncements, createAnnouncement, getAnnouncementById, updateAnnouncement, deleteAnnouncement } = require("../controllers/announcementController");
const { protect, authorize } = require("../middlewares/auth");


// post announcement
router.post("/" , protect, authorize('admin'), createAnnouncement);

// get all announcements
router.get("/", protect, authorize('admin', 'student', 'staff', 'alumni'), getAllAnnouncements);

// get announcement by id
router.get("/:id", protect,authorize('admin', 'student', 'staff', 'alumni'), getAnnouncementById);

// update announcement
router.put("/:id", protect, authorize('admin'), updateAnnouncement);

// delete announcement
router.delete("/:id", protect, authorize('admin'), deleteAnnouncement);








module.exports = router;