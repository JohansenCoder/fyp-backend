const express = require('express');
const router = express.Router();
const { getAllAuditLogs} = require('../controllers/auditLogController');
const { restrictToSystemAdmin, authMiddleware} = require('../middlewares/auth');

// get all admin logs
router.get('/', authMiddleware, restrictToSystemAdmin, getAllAuditLogs);

module.exports = router;
