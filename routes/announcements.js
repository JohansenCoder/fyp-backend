const express = require("express");
const  validate = require('../middlewares/validate');
const { body } = require('express-validator'); 
const router = express.Router();
const { getAllAnnouncements, createAnnouncement, getAnnouncementById, updateAnnouncement, deleteAnnouncement } = require("../controllers/announcementController");
const {authMiddleware, restrictToAdmin} = require("../middlewares/auth");


// post announcement (admin only)
router.post("/",
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
    ]),
     authMiddleware, restrictToAdmin, createAnnouncement);

// get all announcements (public)
router.get("/", authMiddleware, getAllAnnouncements);

// get announcement by id
router.get("/:id",authMiddleware, getAnnouncementById);

// update announcement (admin only)
router.put("/:id",
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
    ]),
     authMiddleware, restrictToAdmin, updateAnnouncement);


// delete announcement (admin only)
router.delete("/:id", authMiddleware, restrictToAdmin, deleteAnnouncement);

module.exports = router;