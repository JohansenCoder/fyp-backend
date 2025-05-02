const express = require('express');
const { body } = require('express-validator');
const passport = require('passport');
const authController = require('../controllers/authController');
const validate = require('../middlewares/validate');
const { authSecurity } = require('../middlewares/authSecurity');


const router = express.Router();

// Public routes
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
            .isIn(['student', 'staff', 'alumni', 'admin'])
            .withMessage('Role must be one of: student, staff, alumni, admin'),
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

router.post(
    '/forgot-password',
    validate([body('email').isEmail().normalizeEmail()]),
    authSecurity,
    authController.forgotPassword
);

router.post(
    '/reset-password',
    validate([
        body('token').notEmpty(),
        body('password').isString().isLength({ min: 8 }),
    ]),
    authController.resetPassword
);

// Protected routes
router.post(
    '/logout',
    passport.authenticate('jwt', { session: false }),
    authController.logout
);



module.exports = router;