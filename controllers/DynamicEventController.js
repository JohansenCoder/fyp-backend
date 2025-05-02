const DynamicEvent = require('../models/DynamicEventSchema');


exports.getAllDynamicEvents = async (req, res) => {
    try {
        const DynamicEvents = await DynamicEvent.find();
        res.status(200).json({
            message: "DynamicEvents fetched successfully",
            DynamicEvents: DynamicEvents
        });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching DynamicEvents", error: error.message });
    }
}

exports.createDynamicEvent = async (req, res) => {
    try {
        const DynamicEvent = await DynamicEvent.create(req.body);
        return res.status(201).json({
            message: "DynamicEvent created successfully",
            DynamicEvent: DynamicEvent
        });
    } catch (err) {
        return res.status(500).json({ message: "Error creating DynamicEvent", error: err.message });
    }
}

exports.getDynamicEventById = async (req, res) => {
    const { id } = req.params;
    const DynamicEvent = await DynamicEvent.findById(id);
    if (!DynamicEvent) { 
        return res.status(404).json({ message: "DynamicEvent not found" });
    }
    res.status(200).json({
        message: "DynamicEvent fetched successfully",
        DynamicEvent: DynamicEvent
    }); 
}

exports.updateDynamicEvent = async (req, res) => {
    const { id } = req.params;
    const DynamicEvent = await DynamicEvent.findById(id);
    if (!DynamicEvent) {
        return res.status(404).json({ message: "DynamicEvent not found" });
    }
    await DynamicEvent.findByIdAndUpdate(id, req.body);
    res.status(200).json({ message: "DynamicEvent updated successfully" });
}

exports.deleteDynamicEvent = async (req, res) => {
    const { id } = req.params;
    const DynamicEvent = await DynamicEvent.findById(id);
    if (!DynamicEvent) {
        return res.status(404).json({ message: "DynamicEvent not found" });
    }   
    await DynamicEvent.findByIdAndDelete(id);
    res.status(200).json({ message: "DynamicEvent deleted successfully" });
}





