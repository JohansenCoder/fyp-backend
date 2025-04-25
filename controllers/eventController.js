// const Event = require('../models/EventsSchema');


// exports.getAllEvents = async (req, res) => {
//     try {
//         const events = await Event.find();
//         res.status(200).json({
//             message: "Events fetched successfully",
//             events: events
//         });
//     } catch (error) {
//         return res.status(500).json({ message: "Error fetching events", error: error.message });
//     }
// }

// exports.createEvent = async (req, res) => {
//     try {
//         const event = await Event.create(req.body);
//         return res.status(201).json({
//             message: "Event created successfully",
//             event: event
//         });
//     } catch (err) {
//         return res.status(500).json({ message: "Error creating event", error: err.message });
//     }
// }

// exports.getEventById = async (req, res) => {
//     const { id } = req.params;
//     const event = await Event.findById(id);
//     if (!event) { 
//         return res.status(404).json({ message: "Event not found" });
//     }
//     res.status(200).json({
//         message: "Event fetched successfully",
//         event: event
//     }); 
// }

// exports.updateEvent = async (req, res) => {
//     const { id } = req.params;
//     const event = await Event.findById(id);
//     if (!event) {
//         return res.status(404).json({ message: "Event not found" });
//     }
//     await Event.findByIdAndUpdate(id, req.body);
//     res.status(200).json({ message: "Event updated successfully" });
// }

// exports.deleteEvent = async (req, res) => {
//     const { id } = req.params;
//     const event = await Event.findById(id);
//     if (!event) {
//         return res.status(404).json({ message: "Event not found" });
//     }   
//     await Event.findByIdAndDelete(id);
//     res.status(200).json({ message: "Event deleted successfully" });
// }





