const express = require("express");
const router = express.Router();
const { createEmergencyContact,getEmergencyContacts,updateEmergencyContact,deleteEmergencyContact } = require('../controllers/emergencyContactController');
const {authMiddleware, restrictToAdmin} = require('../middlewares/auth');


// create emergency contact (admin only)
router.post('/', authMiddleware, restrictToAdmin, createEmergencyContact);

// get emergency contacts
router.get('/getEmergencyContacts', authMiddleware, getEmergencyContacts);


// update an Emergency contact (admin only)
 router.put('/:id', authMiddleware, restrictToAdmin, updateEmergencyContact);

// delete an emergency contact (admin only)
router.delete('/:id',authMiddleware, restrictToAdmin, deleteEmergencyContact)

module.exports = router;
