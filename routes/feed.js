const express = require('express');
const { getFeed,createStory,createPost,reactToPost,commentOnPost, viewStory, getAnalytics} = require('../controllers/feedController');
const {authMiddleware, restrictToSystemAdmin, restrictToAdmin} = require('../middlewares/auth');


const router = express.Router();

// Get feed (stories and posts)
router.get('/', authMiddleware, getFeed);

// Create story (admin only)
router.post('/stories', authMiddleware, restrictToAdmin, createStory);

// delete a story
router.delete('/stories/:id', authMiddleware, restrictToAdmin, deleteStory);

// Create post 
router.post('/posts', authMiddleware, createPost);
// React to post 
router.post('/posts/react/:id', authMiddleware, reactToPost);
// Comment on post
router.post('/posts/comment/:id',authMiddleware, commentOnPost);
// View story
router.post('/stories/view/:id', authMiddleware, viewStory);

// view system wide analytics
router.get('/analytics', authMiddleware, restrictToSystemAdmin, getAnalytics);

module.exports = router;