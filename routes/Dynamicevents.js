const express = require("express");
const router = express.Router();
const { getAllDynamicEvents, createDynamicEvent, getDynamicEventById, updateDynamicEvent, deleteDynamicEvent } = require("../controllers/DynamicEventController");
const { protect, authorize } = require('../middlewares/auth');

// get all DynamicEvents
router.get("/", protect, authorize('admin', 'student', 'staff', 'alumni'), getAllDynamicEvents);
// post DynamicEvent
router.post("/" , protect, authorize('admin'), createDynamicEvent);

// get DynamicEvent by id
router.get("/:id", protect, authorize('admin', 'student', 'staff', 'alumni'), getDynamicEventById);

// update DynamicEvent
router.put("/:id", protect, authorize('admin'), updateDynamicEvent);

// delete DynamicEvent
router.delete("/:id", protect, authorize('admin'), deleteDynamicEvent);


module.exports = router;