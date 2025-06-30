const express = require('express');
const passport = require('passport');
const { getAllUsers, getUserById, createUser, updateUser,updateUserStatus, deleteUser, getProfile, updateProfile, getStudentEngagement, getAllStudentEngagement, getMyEngagement } = require("../controllers/userController");
const validate = require('../middlewares/validate');
const { body } = require('express-validator');
const {restrictToAdmin, authMiddleware, restrictToStudent} = require('../middlewares/auth')

const router = express.Router();

// Protected routes (all users)
router.get(
    '/profile/:id',
    authMiddleware,
    getProfile
);

router.put(
    '/profile/:id',
    authMiddleware,
    validate([
        body('profile.firstName').optional().trim(),
        body('profile.lastName').optional().trim(),
        body('profile.department').optional().trim(),
        body('profile.graduationYear').optional().isInt(),
        body('profile.phone').optional().trim(),
    ]),
    updateProfile
);

// Admin-only routes
router.post(
    '/',
    authMiddleware,
    restrictToAdmin,
    createUser
)

router.get(
    '/',
    authMiddleware,
    restrictToAdmin,
    getAllUsers
);

router.get(
    '/:id',
    authMiddleware,
    restrictToAdmin,
    getUserById
)

router.put(
    '/:id',
    authMiddleware,
   restrictToAdmin,
    validate([
        body('role').optional().isIn(['student', 'visitor', 'alumni', 'college_admin', 'system_admin']),
        body('profile.firstName').optional().trim(),
        body('profile.lastName').optional().trim(),
        body('profile.department').optional().trim(),
        body('profile.location').optional().trim(),
        body('profile.phone').optional().trim(),
        body('profile.bio').optional().trim(),
        body('profile.profilePicture').optional().trim(),
    ]),
    updateUser
);

router.delete(
    '/:id',    authMiddleware,
    restrictToAdmin,
    deleteUser
);

// Student engagement routes
router.get(
    '/engagement/my',
    authMiddleware,
    restrictToStudent,
    getMyEngagement
);

router.get(
    '/engagement/all',
    authMiddleware,
    restrictToAdmin,
    getAllStudentEngagement
);

router.get(
    '/engagement/:id',
    authMiddleware,
    restrictToAdmin,
    getStudentEngagement
);

router.patch(
    '/:id/status',
    authMiddleware,
    restrictToAdmin,
    updateUserStatus
  );

module.exports = router;