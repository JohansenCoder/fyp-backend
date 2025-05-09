const EmergencyContact = require('../models/EmergencyContactSchema');

// create emergency contact (admin only)
exports.createEmergencyContact = async (req, res) => {
    // Validate request body
    validate([
    body('name').notEmpty().withMessage('Name is required'),
    body('phone').notEmpty().withMessage('Phone number is required').matches(/^\+255\d{9}$/),
    body('category').notEmpty().withMessage('Category is required'),
    body('description').optional().isString(),
    body('location').optional().isString(),
    body('priority').optional().isInt({ min: 1 }).withMessage('Priority must be a positive integer'),
    body('visibleTo').optional().isArray().withMessage('VisibleTo must be an array'),
    body('visibleTo.*').isIn(['student', 'staff', 'alumni', 'visitor']).withMessage('Invalid value in visibleTo array'),
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
        const {category, visibleTo,college} = req.query;
        const query = {};
        if (category) {
            query.category = category;
        }
        if (visibleTo) {
            query.visibleTo = { $in: visibleTo };
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
        body('priority').optional().isInt({ min: 1 }).withMessage('Priority must be a positive integer'),
        body('visibleTo').optional().isArray().withMessage('VisibleTo must be an array'),
        body('visibleTo.*').isIn(['student', 'staff', 'alumni', 'visitor']).withMessage('Invalid value in visibleTo array'),
        body('createdAt').optional().isISO8601().toDate(),
        body('updatedAt').optional().isISO8601().toDate()
      ]).run(req);

    const { id } = req.params;
    const emergencyContact = await EmergencyContact.findById(id);
    if (!emergencyContact) {
        res.status(404).json({
            message: "Emergency contact not found"
        });
    }   
    Object.assign(contact, req.body, { updatedBy: req.user.id, updatedAt: new Date() });
    await emergencyContact.save();
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
