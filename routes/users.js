const express = require('express');
const passport = require('passport');
const { getAllUsers, getUserById, createUser, updateUser, deleteUser, getProfile, updateProfile } = require("../controllers/userController");
const validate = require('../middlewares/validate');
const { body } = require('express-validator');
const {restrictToAdmin} = require('../middlewares/auth')

const router = express.Router();

// Protected routes (all users)
router.get(
    '/profile/:id',
    passport.authenticate('jwt', { session: false }),
    getProfile
);

router.put(
    '/profile/:id',
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
    restrictToAdmin,
    createUser
)

router.get(
    '/',
    passport.authenticate('jwt', { session: false }),
    restrictToAdmin,
    getAllUsers
);

router.get(
    '/:id',
    passport.authenticate('jwt', { session: false }),
    restrictToAdmin,
    getUserById
)

router.put(
    '/:id',
    passport.authenticate('jwt', { session: false }),
   restrictToAdmin,
    validate([
        body('role').optional().isIn(['student', 'visitor', 'alumni']),
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
    '/:id',
    passport.authenticate('jwt', { session: false }),
    restrictToAdmin,
    deleteUser
);

module.exports = router;