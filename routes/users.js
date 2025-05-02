const express = require('express');
const passport = require('passport');
const { checkRole } = require('../middlewares/rbac');
const { getAllUsers, getUserById, createUser, updateUser, deleteUser, getProfile, updateProfile } = require("../controllers/userController");
const validate = require('../middlewares/validate');
const { body } = require('express-validator');

const router = express.Router();

// Protected routes (all users)
router.get(
    '/profile',
    passport.authenticate('jwt', { session: false }),
    getProfile
);

router.put(
    '/profile',
    passport.authenticate('jwt', { session: false }),
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
    passport.authenticate('jwt', { session: false }),
    checkRole(['admin']),
    createUser
)

router.get(
    '/',
    passport.authenticate('jwt', { session: false }),
    checkRole(['admin']),
    getAllUsers
);

router.get(
    '/:id',
    passport.authenticate('jwt', { session: false }),
    checkRole(['admin']),
    getUserById
)

router.put(
    '/:id',
    passport.authenticate('jwt', { session: false }),
    checkRole(['admin']),
    validate([
        body('role').optional().isIn(['student', 'staff', 'alumni', 'admin']),
        body('profile.department').optional().trim(),
        body('profile.faculty').optional().trim(),
    ]),
    updateUser
);

router.delete(
    '/:id',
    passport.authenticate('jwt', { session: false }),
    checkRole(['admin']),
    deleteUser
);

module.exports = router;