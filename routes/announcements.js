const express = require("express");
const router = express.Router();
const { getAllAnnouncements, createAnnouncement, getAnnouncementById, updateAnnouncement, deleteAnnouncement } = require("../controllers/announcementController");


// get all announcements
router.get("/", getAllAnnouncements);
// post announcement
router.post("/" , createAnnouncement);

// get announcement by id
router.get("/:id", getAnnouncementById);

// update announcement
router.put("/:id", updateAnnouncement);

// delete announcement
router.delete("/:id", deleteAnnouncement);








module.exports = router;