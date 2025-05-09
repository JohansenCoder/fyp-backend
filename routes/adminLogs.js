const express = require('express');
const router = express.Router();
const { createAdminLog, getAllAdminLogs, getAdminLogById } = require('../controllers/adminLogController');
const { protect, authorize } = require('../middlewares/auth');

// create admin log
router.post('/', createAdminLog);

// get all admin logs
router.get('/', getAllAdminLogs);

// get admin log by id
router.get('/:id', getAdminLogById);


module.exports = router;
