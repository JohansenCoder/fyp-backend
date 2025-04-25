const express = require("express");
const router = express.Router();
const { createEmergencyContact,getAllEmergencyContacts,updateEmergencyContact,deleteEmergencyContact } = require('../controllers/emergencyContactController');

// create emergency contact
router.post('/', createEmergencyContact)

// get all Emergency contacts
router.get('/', getAllEmergencyContacts)

// update an Emergency contact
router.put('/:id', updateEmergencyContact)

// delete an emergency contact
router.delete('/:id', deleteEmergencyContact)

module.exports = router;