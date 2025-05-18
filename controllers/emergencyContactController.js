const EmergencyContact = require('../models/EmergencyContactSchema');
const {logAdminAction} = require('../utils/auditLog');
const {notifyAdminAction} = require('../services/notificationService');
const {validate} = require('../middlewares/validate')

// create emergency contact (admin only)
exports.createEmergencyContact = async (req, res) => {
    // Validate request body
    validate([
    body('name').notEmpty().withMessage('Name is required'),
    body('phone').notEmpty().withMessage('Phone number is required').matches(/^\+255\d{9}$/),
    body('category').notEmpty().withMessage('Category is required'),
    body('description').notEmpty().isString(),
    body('location').notEmpty().isString(),
    body('priority').optional().isInt({ min: 1 }).withMessage('Priority must be a positive integer'),
    body('createdAt').optional().isISO8601().toDate(),
    body('updatedAt').optional().isISO8601().toDate()
  ]).run(req);

  try {
    const emergencyContact = new EmergencyContact({
        ...req.body,
        updatedBy: req.user.id,
        updatedAt: new Date(),
    });
    await emergencyContact.save();

     // Log the action
     const logId = await logAdminAction({
        admin: req.user,
        action: 'Emergency Contact created',
        targetResource: 'Emergency Contact',
        targetId: emergencyContact._id,
        details: { title: emergencyContact.title, updates: req.body },
        ipAddress: req.ip,
    });

    await notifyAdminAction({
        college: emergencyContact.college,
        message: `Emergency Contact "${emergencyContact.title}" created`,
        actionType: 'Emergency Contact Created',
        logId,
    });

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

// get  emergency contacts
exports.getEmergencyContacts = async (req, res) => {
    try{
        const {category,college} = req.query;
        const query = {};
        if (category) {
            query.category = category;
        }
        if (college) {
            query.college = college;
        }
        const emergencyContacts = await EmergencyContact.find(query);
        res.status(200).json({
            message: "Emergency contacts fetched successfully",
            emergencyContacts: emergencyContacts
        });
    }
    catch (err) {
        res.status(500).json({
            message: "Error fetching emergency contacts",
            error: err
        });
    }
}

exports.updateEmergencyContact = async (req, res) => {
    // Validate request body
    validate([
        body('name').optional().notEmpty().withMessage('Name is required'),
        body('phone').optional().notEmpty().withMessage('Phone number is required').matches(/^\+255\d{9}$/),
        body('category').optional().notEmpty().withMessage('Category is required'),
        body('description').optional().isString(),
        body('location').optional().isString(),
        body('priority').optional().isInt({ min: 1 }).withMessage('Priority must be a positive integer')
      ]).run(req);

   try {
    const { id } = req.params;
    const emergencyContact = await EmergencyContact.findById(id);
    if (!emergencyContact) {
        res.status(404).json({
            message: "Emergency contact not found"
        });
    }   
    Object.assign(contact, req.body, { updatedBy: req.user.id, updatedAt: new Date() });
    await emergencyContact.save();
     
    // Log the action
    const logId = await logAdminAction({
        admin: req.user,
        action: 'Emergency Contact updated',
        targetResource: 'Emergency Contact',
        targetId: emergencyContact._id,
        details: { title: emergencyContact.title, updates: req.body },
        ipAddress: req.ip,
    });

    await notifyAdminAction({
        college: emergencyContact.college,
        message: `Emergency Contact "${emergencyContact.title}" updated`,
        actionType: 'Emergency Contact Updated',
        logId,
    });


    res.status(200).json({
        message: "Emergency contact updated successfully",
        emergencyContact: emergencyContact
    });
   }
    catch (err) {
     res.status(500).json({
          message: "Error updating emergency contact",
          error: err
     });
    }
}

exports.deleteEmergencyContact = async (req, res) => {
    try{
        const { id } = req.params;
    const emergencyContact = await EmergencyContact.findById(id);
    if (!emergencyContact) {
        res.status(404).json({
            message: "Emergency contact not found"
        });
    }   
    await EmergencyContact.findByIdAndDelete(id);

     // Log the action
     const logId = await logAdminAction({
        admin: req.user,
        action: 'Emergency Contact deleted',
        targetResource: 'Emergency Contact',
        targetId: emergencyContact._id,
        details: { title: emergencyContact.title, updates: req.body },
        ipAddress: req.ip,
    });

    await notifyAdminAction({
        college: emergencyContact.college,
        message: `Emergency Contact "${emergencyContact.title}" deleted`,
        actionType: 'Emergency Contact Deleted',
        logId,
    });
    
    res.status(200).json({
        message: "Emergency contact deleted successfully",
        emergencyContact: emergencyContact
    });
    }
    catch (err) {
        res.status(500).json({
            message: "Error deleting emergency contact",
            error: err
        });
    }
}
