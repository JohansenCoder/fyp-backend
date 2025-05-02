const express = require("express");
const router = express.Router();
const { createEmergencyContact,getAllEmergencyContacts,updateEmergencyContact,deleteEmergencyContact } = require('../controllers/emergencyContactController');
const { protect, authorize } = require('../middlewares/auth');

// create emergency contact
router.post('/', protect, authorize('admin'), createEmergencyContact)

// get all Emergency contacts
router.get('/', protect, authorize('admin', 'student', 'staff', 'alumni'), getAllEmergencyContacts)

// update an Emergency contact
router.put('/:id', protect, authorize('admin'), updateEmergencyContact)

// delete an emergency contact
router.delete('/:id', protect, authorize('admin'), deleteEmergencyContact)

module.exports = router;