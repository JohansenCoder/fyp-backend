// src/controllers/feedController.js
const { body, param, query } = require('express-validator');
const StorySchema = require('../models/StorySchema');
const PostSchema = require('../models/PostSchema');
const UserSchema = require('../models/UserSchema');
const { notifyNewStory, notifyNewPost, notifyAdminAction } = require('../services/notificationService');
const winston = require('winston');
const { logAdminAction } = require('../utils/auditLog');
const { validate } = require('../middlewares/validate');
const StudentEngagementTracker = require('../utils/studentEngagement');

const logger = winston.createLogger({
    transports: [new winston.transports.Console()],
});

// Get feed (stories and posts)
exports.getFeed = async (req, res) => {
    try {
        const { college, role } = req.user; // From auth middleware
        const { page = 1, limit = 10 } = req.query;

        // Get stories (active, within 24 hours)
        const stories = await StorySchema.find({ college })
            .populate('postedBy', 'username profile.firstName profile.lastName')
            .sort({ createdAt: -1 });

        // Get posts
        const query = {
            $or: [
                { college: college || { $exists: false } },
                { targetRoles: role || { $exists: false } },
                { tags: { $in: req.user.interests || [] } },
            ],
        };
        const posts = await PostSchema.find(query)
            .populate('postedBy', 'username profile.firstName profile.lastName')
            .populate('reactions.user', 'username')
            .populate('comments.user', 'username')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({ stories, posts });
    } catch (error) {
        logger.error(`Get feed error: ${error.message}`);
        res.status(500).json({ message: 'Failed to fetch feed' });
    }
};

// Create story (admin only)
exports.createStory = 
  async (req, res) => {
    // validate request body
    validate([
        body('content').notEmpty().trim(),
        body('college').notEmpty().trim()
    ])
        try {
            if (req.user.role !== 'admin' || req.user.college !== req.body.college) {
                return res.status(403).json({ message: 'Only college admins can post stories' });
            }

            const story = new StorySchema({
                content: req.body.content,
                college: req.body.college,
                postedBy: req.user.id,
            });
            await story.save();

            // log the action
            const logId = await logAdminAction({
                admin: req.user,
                action: 'story_created',
                targetResource: 'story',
                targetId: story._id,
                details: { college: story.college, content: story.content },
                ipAddress: req.ip,
            });

            await notifyNewStory(story);
            // Notify admin about the new story
            await notifyAdminAction({
                college: story.college,
                message: `Story created for ${story.college}`,
                actionType: 'Story Creation',
                logId,
            });
            res.status(201).json(story);
        } catch (error) {
            logger.error(`Create story error: ${error.message}`);
            res.status(500).json({ message: 'Failed to create story' });
        }
    };

// delete a story
exports.deleteStory = async (req, res) => {
    try {
        const story = await StorySchema.findById(req.params.id);
        if (!story) return res.status(404).json({ message: 'Story not found' });
        await story.deleteOne();
        // log the action
        const logId = await logAdminAction({
            admin: req.user,
            action: 'story_deleted',
            targetResource: 'story',
            targetId: story._id,
        });
        await notifyAdminAction({
            college: story.college,
            message: `Story "${story.content}" deleted`,
            actionType: 'Story Deletion',
            logId,
        });
        res.json({ message: 'Story deleted successfully' });
    } catch (error) {
        logger.error(`Delete story error: ${error.message}`);
        res.status(500).json({ message: 'Failed to delete story' });
    }
};

// Create post
exports.createPost = 
    async (req, res) => {
        // validate request body
        validate([
            body('title').notEmpty().trim(),
            body('content').notEmpty().trim(),
            body('college').optional().trim(),
            body('targetRoles').optional().isArray(),
            body('tags').optional().isArray()
        ])
        try {
            if(req.user.role=='vivtor'){
                return res.status(404).json({message: "Visitors can not create posts"})
            }
             const post = new PostSchema({
                ...req.body,
                postedBy: req.user.id,
            });
            await post.save();
            
            // Track student engagement for post creation
            if (req.user.role === 'student') {
                await StudentEngagementTracker.incrementPostCount(req.user.id);
            }
            
            await notifyNewPost(post);
            // log the action
            const logId = await logAdminAction({
                admin: req.user,
                action: 'post_created',
                targetResource: 'post',
                targetId: post._id,
                details: { title: post.title, college: post.college },
                ipAddress: req.ip,
            });
            // Notify admin about the new post
            await notifyNewPost(post);
            await notifyAdminAction({
                college: post.college,
                message: `Post "${post.title}" created`,
                actionType: 'Post Creation',
                logId,
            });

            res.status(201).json(post);
        } catch (error) {
            logger.error(`Create post error: ${error.message}`);
            res.status(500).json({ message: 'Failed to create post' });
        }
    };

// React to post
exports.reactToPost = [
    param('id').isMongoId(),
    body('type').isIn(['like', 'celebrate', 'support']),
    async (req, res) => {
        try {
            const post = await PostSchema.findById(req.params.id);
            if (!post) return res.status(404).json({ message: 'Post not found' });

            const existingReaction = post.reactions.find(r => r.user.toString() === req.user.id);
            if (existingReaction) {
                existingReaction.type = req.body.type;
            } else {
                post.reactions.push({ user: req.user.id, type: req.body.type });
            }
            await post.save();
            // log if admin reacts to a post
            if (['college_admin', 'system_admin'].includes(req.user.role)) {
                await logAdminAction({
                    admin: req.user,
                    action: 'post_reacted',
                    targetResource: 'post',
                    targetId: post._id,
                    details: { reactionType: req.body.type },
                    ipAddress: req.ip,
                });
            }

            res.json(post.reactions);
        } catch (error) {
            logger.error(`React to post error: ${error.message}`);
            res.status(500).json({ message: 'Failed to react to post' });
        }
    },
];

// Comment on post
exports.commentOnPost = [
    param('id').isMongoId(),
    body('content').notEmpty().trim(),
    async (req, res) => {
        try {
            const post = await PostSchema.findById(req.params.id);
            if (!post) return res.status(404).json({ message: 'Post not found' });

            post.comments.push({ user: req.user.id, content: req.body.content });
            await post.save();

            // if an admin comments on a post log the action
            if (['college_admin', 'system_admin'].includes(req.user.role)) {
                await logAdminAction({
                    admin: req.user,
                    action: 'post_commented',
                    targetResource: 'post',
                    targetId: post._id,
                    details: { comment: req.body.content },
                    ipAddress: req.ip,
                });
            }

            res.json(post.comments);
        } catch (error) {
            logger.error(`Comment on post error: ${error.message}`);
            res.status(500).json({ message: 'Failed to comment on post' });
        }
    },
];

// Mark story as viewed
exports.viewStory = [
    param('id').isMongoId(),
    async (req, res) => {
        try {
            const story = await StorySchema.findById(req.params.id);
            if (!story) return res.status(404).json({ message: 'Story not found' });

            if (!story.viewers.includes(req.user.id)) {
                story.viewers.push(req.user.id);
                await story.save();
            }
            res.json({ message: 'Story marked as viewed' });
        } catch (error) {
            logger.error(`View story error: ${error.message}`);
            res.status(500).json({ message: 'Failed to view story' });
        }
    },
];

// Get analytics (college or system admin)
exports.getAnalytics = async (req, res) => {
    try {
        const { college } = req.params;
        if (college && req.user.role !== 'system_admin' && req.user.college !== college) {
            return res.status(403).json({ message: 'You can only view your college analytics' });
        }

        const query = college ? { college } : {};
        const userCount = await UserSchema.countDocuments(query);
        const postCount = await PostSchema.countDocuments(query);

        res.json({ userCount, postCount });
    } catch (error) {
        logger.error(`Get analytics error: ${error.message}`);
        res.status(500).json({ message: 'Failed to fetch analytics' });
    }
};