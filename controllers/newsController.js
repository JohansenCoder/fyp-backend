const News = require('../models/NewsSchema');
const {notifyNews} = require('../services/notificationService');
const User = require('../models/UserSchema');
const { body } = require('express-validator');
const { validate } = require('../middlewares/validate');

//create news (admin only)
exports.createNews = async (req, res) => {
    // Validate the request body
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
    ])
    try {
        const news = await News.create(req.body);
        // Notify users about the news
        await notifyNews(news);
        return res.status(201).json({
            message: "News created successfully",
            news: news
        });
    } catch (err) {
        return res.status(500).json({ message: "Error creating news", error: err.message });
    }
}

// Get all news for the user
// This will be used to fetch news relevant to the user
exports.getAllNews = async (req, res) => {

    try {
        const user = await User.findById(req.user.userId);
        const query = {
            isPublished: true,
            $or: [
                { collegeScope: { $in: [user.college] } },
                { tags: { $in: user.interests } }
            ]
        };
        const news = await News.find(query);
        res.status(200).json({
            message: "News fetched successfully",
            news: news
        });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching news", error: error.message });
    }
}
// Get news by ID
exports.getNewsById = async (req, res) => {
    const { id } = req.params;
    const news = await News.findById(id);
    if (!news) {
        return res.status(404).json({ message: "News not found" });
    }
    res.status(200).json({
        message: "News fetched successfully",
        news: news
    }); 
}

// Update news (admin only)
exports.updateNews = async (req, res) => {
    // Validate the request body
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
    ])
    const { id } = req.params;
    const news = await News.findById(id);
    if (!news) {
        return res.status(404).json({ message: "News not found" });
    }
    await News.findByIdAndUpdate(id, req.body);
    res.status(200).json({ message: "News updated successfully" });
}

// Delete news (admin only)
exports.deleteNews = async (req, res) => {
    const { id } = req.params;
    const news = await News.findById(id);
    if (!news) {
        return res.status(404).json({ message: "News not found" });
    }   
    await News.findByIdAndDelete(id);
    res.status(200).json({ message: "News deleted successfully" });
}





