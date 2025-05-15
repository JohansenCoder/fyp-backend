const News = require('../models/NewsSchema');
const {notifyNews} = require('../services/notificationService');
const User = require('../models/UserSchema');
const { body } = require('express-validator');
const { validate } = require('../middlewares/validate');
const { logAdminAction } = require('../utils/auditLog');

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
        // Log the admin action
        const logId = await logAdminAction({
            admin: req.user,
            action: 'news_created',
            targetResource: 'news',
            targetId: news._id,
            details: { title: news.title, college: news.college },
            ipAddress: req.ip,
        });
        // Notify admin about the news creation
        await notifyAdminAction({
            college: news.college,
            message: `News "${news.title}" created`,
            actionType: 'News Creation',
            logId,
        });
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
   try {
    const { id } = req.params;
    const news = await News.findById(id);
    if (!news) {
        return res.status(404).json({ message: "News not found" });
    }
    await News.findByIdAndUpdate(id, req.body);
    // log the admin action
    const logId = await logAdminAction({
        admin: req.user,
        action: 'news_updated',
        targetResource: 'news',
        targetId: news._id,
        details: { title: news.title, updates: req.body },
        ipAddress: req.ip,
    });
    // Notify admin about the news update
    await notifyAdminAction({
        college: news.college,
        message: `News "${news.title}" updated`,
        actionType: 'News Update',
        logId,
    });
    res.status(200).json({ message: "News updated successfully" });
   }
   catch (error) {
    return res.status(500).json({ message: "Error updating news", error: error.message });
   }
}

// Delete news (admin only)
exports.deleteNews = async (req, res) => {
  try {
    const { id } = req.params;
    const news = await News.findById(id);
    if (!news) {
        return res.status(404).json({ message: "News not found" });
    }   
    await News.findByIdAndDelete(id);
    // log the admin action
    const logId = await logAdminAction({
        admin: req.user,
        action: 'news_deleted',
        targetResource: 'news',
        targetId: req.params.id,
        details: { title: news.title },
        ipAddress: req.ip,
    });
    // Notify admin about the news deletion
    await notifyAdminAction({
        college: news.college,
        message: `News "${news.title}" deleted`,
        actionType: 'News Deletion',
        logId,
    });
    res.status(200).json({ message: "News deleted successfully" });
  }
  catch (error) {
    return res.status(500).json({ message: "Error deleting news", error: error.message });
  }
}





