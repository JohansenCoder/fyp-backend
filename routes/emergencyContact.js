const express = require("express");
const router = express.Router();
const { createEmergencyContact,getEmergencyContacts,updateEmergencyContact,deleteEmergencyContact } = require('../controllers/emergencyContactController');
const {authMiddleware, restrictToSystemAdmin} = require('../middlewares/auth');


// create emergency contact (admin only)
router.post('/', authMiddleware, restrictToSystemAdmin, createEmergencyContact);

// get emergency contacts
router.get('/getEmergencyContacts', authMiddleware, getEmergencyContacts);


// update an Emergency contact (admin only)
 router.put('/:id', authMiddleware, restrictToSystemAdmin, updateEmergencyContact);

// delete an emergency contact (admin only)
router.delete('/:id',authMiddleware, restrictToSystemAdmin, deleteEmergencyContact)

module.exports = router;
