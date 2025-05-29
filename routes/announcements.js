const express = require("express");
const router = express.Router();
const { getAllAnnouncements, createAnnouncement, getAnnouncementById, updateAnnouncement, deleteAnnouncement } = require("../controllers/announcementController");
const {authMiddleware, restrictToAdmin} = require("../middlewares/auth");


// post announcement (admin only)
router.post("/", authMiddleware, restrictToAdmin, createAnnouncement);

// get all announcements (public)
router.get("/", authMiddleware, getAllAnnouncements);

// get announcement by id
router.get("/:id",authMiddleware, getAnnouncementById);

// update announcement (admin only)
router.put("/:id", authMiddleware, restrictToAdmin, updateAnnouncement);


// delete announcement (admin only)
router.delete("/:id", authMiddleware, restrictToAdmin, deleteAnnouncement);

module.exports = router;