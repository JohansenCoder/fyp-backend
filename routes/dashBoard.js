const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth');
const { getDashboardData, getDashboardUpdates } = require('../controllers/dashboardController');

// Get comprehensive dashboard data
router.get('/', authMiddleware, getDashboardData);

// Get real-time updates
router.get('/updates', authMiddleware, getDashboardUpdates);

module.exports = router;