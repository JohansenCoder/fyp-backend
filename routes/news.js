const express = require("express");
const router = express.Router();
const { getAllNews, createNews, getNewsById, updateNews, deleteNews } = require("../controllers/newsController");
const { authMiddleware, restrictToAdmin } = require("../middlewares/auth");
const  validate = require('../middlewares/validate');
const { body } = require('express-validator');


// create news (admin only)
router.post("/", 
    validate([
        body('headline').notEmpty().trim(),
        body('content').notEmpty().trim(),
        body('category').isIn(['sports', 'technology', 'health', 'academics', 'alumni', 'students_life', 'external_partnerships']),
        body('createdBy').notEmpty().trim(),
        body('targetRoles').optional().isArray(),
        body('attachments').optional().isURL(),
        body('tags').optional().isArray(),
        body('collegeScope').optional().isArray(),
        body('isPublished').optional().isBoolean(),
        body('isArchived').optional().isBoolean(),
    ]),
    authMiddleware, restrictToAdmin, createNews);

// get all news (public)
router.get("/", authMiddleware, getAllNews);

// get news by ID (public)
router.get("/:id", authMiddleware, getNewsById);

// update news (admin only)
router.put("/:id",
    validate([
        body('headline').optional().notEmpty().trim(),
        body('content').optional().notEmpty().trim(),
        body('category').optional().isIn(['sports', 'technology', 'health', 'academics', 'alumni', 'students_life', 'external_partnerships']),
        body('createdBy').optional().notEmpty().trim(),
        body('targetRoles').optional().isArray(),
        body('attachments').optional().isURL(),
        body('tags').optional().isArray(),
        body('collegeScope').optional().isArray(),
        body('isPublished').optional().isBoolean(),
        body('isArchived').optional().isBoolean(),
    ]),
     authMiddleware, restrictToAdmin, updateNews);

// delete news (admin only)
router.delete("/:id", authMiddleware, restrictToAdmin, deleteNews);

module.exports = router;