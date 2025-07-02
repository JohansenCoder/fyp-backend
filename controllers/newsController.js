const News = require('../models/NewsSchema');
const { notifyNews, notifyAdminAction } = require('../services/notificationService');
const User = require('../models/UserSchema');
const { logAdminAction } = require('../utils/auditLog');

exports.createNews = async (req, res) => {
  try {
    const news = await News.create({
      ...req.body,
      createdBy: req.user.id,
      updatedAt: new Date()
    });
    await notifyNews(news);
    const logId = await logAdminAction({
      admin: req.user,
      action: 'news_created',
      targetResource: 'news',
      targetId: news._id,
      details: { title: news.title, college: news.college },
      ipAddress: req.ip,
    });
    await notifyAdminAction({
      college: news.college,
      message: `News "${news.title}" created`,
      actionType: 'News Creation',
      logId,
    });
    return res.status(201).json({
      message: "News article created successfully",
      news
    });
  } catch (err) {
    return res.status(500).json({ message: "Error creating news", error: err.message });
  }
};

exports.getAllNews = async (req, res) => {
  try {
    const user = await User.findById(req.user?.id);
    
    // Validate user
    if (!user) {
      return res.status(401).json({ message: 'User not found or unauthorized' });
    }

    // Initialize query object
    const query = {
      isPublished: true,
      isArchived: false,
    };

    if (user.role === 'system_admin') {
      // No additional filters, system admin sees all active news
    } else if (user.role === 'college_admin') {
      // Filter by college for college admin
      query.college = user.college;
    } else {
      // Regular user filters
      query.$or = [
        { college: { $in: [user.college] } },
        { targetRoles: user.role },
        { tags: { $in: user.interests || [] } }, // Handle undefined interests
      ];
    }

    const news = await News.find(query).sort({ createdAt: -1 }).lean();
    res.status(200).json({
      message: 'News fetched successfully',
      news,
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    return res.status(500).json({ message: 'Error fetching news', error: error.message });
  }
};

exports.getNewsById = async (req, res) => {
  try {
    const { id } = req.params;
    const news = await News.findById(id);
    if (!news) {
      return res.status(404).json({ message: "News not found" });
    }
    res.status(200).json({
      message: "News fetched successfully",
      news
    });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching news", error: error.message });
  }
};

exports.updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const news = await News.findById(id);
    if (!news) {
      return res.status(404).json({ message: "News not found" });
    }
    const updatedNews = await News.findByIdAndUpdate(
      id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    const logId = await logAdminAction({
      admin: req.user,
      action: 'news_updated',
      targetResource: 'news',
      targetId: news._id,
      details: { title: news.title, updates: req.body },
      ipAddress: req.ip,
    });
    await notifyAdminAction({
      college: news.college,
      message: `News "${news.title}" updated`,
      actionType: 'News Update',
      logId,
    });
    res.status(200).json({
      message: "News updated successfully",
      news: updatedNews
    });
  } catch (error) {
    return res.status(500).json({ message: "Error updating news", error: error.message });
  }
};

exports.deleteNews = async (req, res) => {
  try {
    const { id } = req.params;
    const news = await News.findById(id);
    if (!news) {
      return res.status(404).json({ message: "News not found" });
    }
    await News.findByIdAndDelete(id);
    const logId = await logAdminAction({
      admin: req.user,
      action: 'news_deleted',
      targetResource: 'news',
      targetId: news._id,
      details: { title: news.title },
      ipAddress: req.ip,
    });
    await notifyAdminAction({
      college: news.college,
      message: `News "${news.title}" deleted`,
      actionType: 'News Deletion',
      logId,
    });
    res.status(200).json({ message: "News deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting news", error: error.message });
  }
};

exports.toggleArchiveNews = async (req, res) => {
  try {
    const { id } = req.params;
    const news = await News.findById(id);
    if (!news) {
      return res.status(404).json({ message: "News not found" });
    }
    const isArchived = !news.isArchived;
    const updatedNews = await News.findByIdAndUpdate(
      id,
      { isArchived, updatedAt: new Date() },
      { new: true }
    );
    const logId = await logAdminAction({
      admin: req.user,
      action: isArchived ? 'news_archived' : 'news_unarchived',
      targetResource: 'news',
      targetId: news._id,
      details: { title: news.title, isArchived },
      ipAddress: req.ip,
    });
    await notifyAdminAction({
      college: news.college,
      message: `News "${news.title}" ${isArchived ? 'archived' : 'unarchived'}`,
      actionType: isArchived ? 'News Archival' : 'News Unarchival',
      logId,
    });
    res.status(200).json({
      message: `News ${isArchived ? 'archived' : 'unarchived'} successfully`,
      news: updatedNews
    });
  } catch (error) {
    return res.status(500).json({ message: "Error toggling archive status", error: error.message });
  }
}

exports.togglePublishNews = async (req, res) => {
  try {
    const { id } = req.params;
    const news = await News.findById(id);
    if (!news) {
      return res.status(404).json({ message: "News not found" });
    }
    const isPublished = !news.isPublished;
    const updatedNews = await News.findByIdAndUpdate(
      id,
      { isPublished, updatedAt: new Date() },
      { new: true }
    );
    const logId = await logAdminAction({
      admin: req.user,
      action: isPublished ? 'news_published' : 'news_unpublished',
      targetResource: 'news',
      targetId: news._id,
      details: { title: news.title, isPublished },
      ipAddress: req.ip,
    });
    await notifyAdminAction({
      college: news.college,
      message: `News "${news.title}" ${isPublished ? 'published' : 'unpublished'}`,
      actionType: isPublished ? 'News Publication' : 'News Unpublication',
      logId,
    });
    res.status(200).json({
      message: `News ${isPublished ? 'published' : 'unpublished'} successfully`,
      news: updatedNews
    });
  }
  catch (error) {
    return res.status(500).json({ message: "Error toggling publish status", error: error.message });
  }
}
