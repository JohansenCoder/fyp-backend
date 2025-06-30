const express = require('express');
const { body } = require('express-validator');
const passport = require('passport');
const authController = require('../controllers/AuthController');
const validate = require('../middlewares/validate');
const { authSecurity } = require('../middlewares/authSecurity');


const router = express.Router();

// Public routes

// allow a user to register
router.post(
    '/register',
    validate([
        body('username')
            .notEmpty()
            .withMessage('Username is required')
            .isString()
            .withMessage('Invalid username')
            .trim()
            .isLength({ min: 3 })
            .withMessage('Username must be at least 3 characters long'),
        body('email')
            .isEmail()
            .withMessage('Invalid email')
            .normalizeEmail(),
        body('password')
            .notEmpty()
            .withMessage('Password is required')
            .isString()
            .withMessage('Invalid password')
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters long'),
        body('role')
            .notEmpty()
            .isIn(['student', 'visitor', 'alumni', 'college_admin','system_admin'])
            .withMessage('Role must be one of: student,visitor, staff, alumni, system_admin, college_admin'),
        body('college')
            .isString(),
        body('profile.firstName').optional().trim(),
        body('profile.lastName').optional().trim(),
        body('profile.department').optional().trim(),
        body('profile.graduationYear').optional().isInt(),
        body('profile.phone').optional().trim(),
        body('profile.faculty').optional().trim(),
    ]),
    authSecurity, 
    authController.register
);

// allow a user to login
router.post(
    '/login',
    validate([
        body('username')
        .notEmpty()
        .withMessage('Username is required')
        .isString()
        .withMessage('Invalid username')
        .trim(),
        body('password') 
        .notEmpty()
        .withMessage('Password is required')
        .isString()
        .withMessage('Invalid password'),
    ]),
    authSecurity,
    authController.login
);

// allow a user to forget password
// send a reset password link to the user's email
router.post(
    '/forgot-password',
    validate([body('email').isEmail().normalizeEmail()]),
    authSecurity,
    authController.forgotPassword
);

// allow a user to reset password
router.post(
    '/reset-password',
    validate([
        body('token').notEmpty(),
        body('password').isString().isLength({ min: 8 }),
    ]),
    authController.resetPassword
);

// Protected routes, allows a user to logout
router.post(
    '/logout',
    passport.authenticate('jwt', { session: false }),
    authController.logout
);



module.exports = router;