const express = require('express');
const router = express.Router();
const { createAdminLog, getAllAdminLogs, getAdminLogById } = require('../controllers/adminLogController');
const { protect, authorize } = require('../middlewares/auth');

// create admin log
router.post('/', protect, authorize('admin'), createAdminLog);

// get all admin logs
router.get('/',protect, authorize('admin'), getAllAdminLogs);

// get admin log by id
router.get('/:id', protect, authorize('admin'), getAdminLogById);


module.exports = router;
