const express = require("express");
const router = express.Router();
const { getAllEvents, createEvent, getEventById, updateEvent, deleteEvent } = require("../controllers/eventController");


// get all events
router.get("/", getAllEvents);
// post event
router.post("/new" , createEvent);

// get event by id
router.get("/:id", getEventById);

// update event
router.put("/:id", updateEvent);

// delete event
router.delete("/:id", deleteEvent);


module.exports = router;