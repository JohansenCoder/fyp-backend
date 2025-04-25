const EmergencyContact = require('../models/EmergencyContactSchema');


exports.createEmergencyContact = async (req, res) => {
  try {
    const emergencyContact = await EmergencyContact.create(req.body);
    res.status(201).json({
      message: "Emergency contact created successfully",
      emergencyContact: emergencyContact
    });
  } catch (err) {
    res.status(500).json({
      message: "Error creating emergency contact",
      error: err
    });
  }
}           

exports.getAllEmergencyContacts = async (req, res) => {
    try{
        const emergencyContacts = await EmergencyContact.find();
        res.status(200).json({  
            message: "Emergency contacts fetched successfully",
            emergencyContacts: emergencyContacts
        });
    } catch (err) {
        res.status(500).json({
            message: "Error fetching emergency contacts",
            error: err
        });
    }
}

exports.updateEmergencyContact = async (req, res) => {

    const { id } = req.params;
    const emergencyContact = await EmergencyContact.findById(id);
    if (!emergencyContact) {
        res.status(404).json({
            message: "Emergency contact not found"
        });
    }   
    await EmergencyContact.findByIdAndUpdate(id, req.body);
    res.status(200).json({
        message: "Emergency contact updated successfully",
        emergencyContact: emergencyContact
    });
}

exports.deleteEmergencyContact = async (req, res) => {
    const { id } = req.params;
    const emergencyContact = await EmergencyContact.findById(id);
    if (!emergencyContact) {
        res.status(404).json({
            message: "Emergency contact not found"
        });
    }   
    await EmergencyContact.findByIdAndDelete(id);
    res.status(200).json({
        message: "Emergency contact deleted successfully",
        emergencyContact: emergencyContact
    });


}
