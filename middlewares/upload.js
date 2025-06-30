// middlewares/upload.js
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'udsm_events', // Cloudinary folder for uploads
    allowed_formats: ['jpg', 'png', 'jpeg', 'mp4', 'mov'], // Allow images and videos
    resource_type: 'auto', // Automatically detect resource type (image or video)
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit to 10MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|mp4|mov/;
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype) {
      return cb(null, true);
    }
    cb(new Error('File type not supported'));
  },
});

module.exports = upload;