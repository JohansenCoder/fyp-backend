const express = require('express');
const { getAllNews, createNews, getNewsById, updateNews, deleteNews } = require('../controllers/newsController');
const { authMiddleware, restrictToAdmin } = require ('../middlewares/auth');
const validate = require('../middlewares/validate');
const { body } = require ('express-validator');

const router = express.Router();

router.post(
  '/',
  validate([
    body('title').notEmpty().trim(),
    body('content').notEmpty().trim(),
    body('category').isIn(['sports', 'technology', 'health', 'academics', 'alumni', 'students_life', 'career_fair']),
    body('targetRoles').isArray().notEmpty(),
    body('targetRoles.*').isIn(['student', 'visitor', 'alumni']),
    body('college').isArray().notEmpty(),
    body('media').optional().isArray(),
    body('media.*.url').optional().isURL(),
    body('media.*.type').optional().isIn(['image', 'video']),
    body('tags').optional().isArray(),
    body('isPublished').optional().isBoolean(),
    body('isArchived').optional().isBoolean(),
    body('scheduledAt').optional().isISO8601(),
  ]),
  authMiddleware,
  restrictToAdmin,
  createNews
);

router.get('/', authMiddleware, getAllNews);

router.get('/:id', authMiddleware, getNewsById);

router.put(
  '/:id',
  validate([
    body('title').optional().notEmpty().trim(),
    body('content').optional().notEmpty().trim(),
    body('category').optional().isIn(['sports', 'technology', 'health', 'academics', 'alumni', 'students_life', 'career_fair']),
    body('targetRoles').optional().isArray(),
    body('targetRoles.*').optional().isIn(['student', 'visitor', 'alumni']),
    body('college').optional().isArray(),
    body('media').optional().isArray(),
    body('media.*.url').optional().isURL(),
    body('media.*.type').optional().isIn(['image', 'video']),
    body('tags').optional().isArray(),
    body('isPublished').optional().isBoolean(),
    body('isArchived').optional().isBoolean(),
    body('scheduledAt').optional().isISO8601(),
  ]),
  authMiddleware,
  restrictToAdmin,
  updateNews
);

router.delete('/:id', authMiddleware, restrictToAdmin, deleteNews);

module.exports = router;