const express = require('express');
const { getFeed,createStory,createPost,reactToPost,commentOnPost, viewStory, deleteStory, getAnalytics} = require('../controllers/feedController');
const {authMiddleware, restrictToSystemAdmin, restrictToAdmin} = require('../middlewares/auth');
const  validate = require('../middlewares/validate');
const { body } = require('express-validator');


const router = express.Router();

// Get feed (stories and posts)
router.get('/', authMiddleware, getFeed);

// Create story (admin only)
router.post('/stories',
    validate([
        body('content').notEmpty().trim(),
        body('college').notEmpty().trim()
    ]),
     authMiddleware, restrictToAdmin, createStory);

// delete a story
router.delete('/stories/:id', authMiddleware, restrictToAdmin, deleteStory);

// Create post 
router.post('/posts', 
    validate([
        body('title').notEmpty().trim(),
        body('content').notEmpty().trim(),
        body('college').optional().trim(),
        body('targetRoles').optional().isArray(),
        body('tags').optional().isArray()
    ]),
    authMiddleware, createPost);
// React to post 
router.post('/posts/react/:id', authMiddleware, reactToPost);
// Comment on post
router.post('/posts/comment/:id',authMiddleware, commentOnPost);
// View story
router.post('/stories/view/:id', authMiddleware, viewStory);


// view system wide analytics
router.get('/analytics', authMiddleware, restrictToSystemAdmin, getAnalytics);

module.exports = router;