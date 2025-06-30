// middlewares/mediaValidation.js
const validateMedia = (req, res, next) => {
    if (req.files && req.files.length > 0) {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'video/mp4', 'video/mov', 'video/avi'];
        const maxFileSize = 10 * 1024 * 1024; // 10MB
        
        for (const file of req.files) {
            // Check file type
            if (!allowedTypes.includes(file.mimetype)) {
                return res.status(400).json({ 
                    error: `Invalid file type: ${file.mimetype}. Only JPEG, PNG, GIF, MP4, MOV, and AVI files are allowed.` 
                });
            }
            
            // Check file size
            if (file.size > maxFileSize) {
                return res.status(400).json({ 
                    error: `File ${file.originalname} is too large. Maximum size is 10MB.` 
                });
            }
        }
        
        // Check total number of files
        if (req.files.length > 5) {
            return res.status(400).json({ 
                error: 'Maximum 5 media files allowed per event.' 
            });
        }
    }
    
    next();
};

module.exports = { validateMedia };
