const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        let folder = 'mean_app/others';
        let public_id = undefined;

        if (req.originalUrl.includes('shops')) {
            folder = 'mean_app/shops/logo';
            // If updating a shop logo, try to keep a predictable ID or let Cloudinary handle it.
            // Using shop ID as public_id ensures we overwrite existing logo if desired, 
            // but might have caching issues if URL doesn't change. 
            // Safest for now is to let Cloudinary generate a new one, or append timestamp.
            if (req.params.id && req.method === 'PUT') {
                 public_id = `${req.params.id}_${Date.now()}`;
            }
        } else if (req.originalUrl.includes('products')) {
            folder = 'mean_app/products';
        }

        return {
            folder: folder,
            allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp'],
            public_id: public_id, // optional
        };
    },
});

const fileFilter = (req, file, cb) => {
    const allowedFileTypes = /jpeg|jpg|png|gif|webp/;
    
    // Check extension
    const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
    // Check mimetype
    const mimetype = allowedFileTypes.test(file.mimetype);

    console.log(`Checking file: ${file.originalname} (${file.mimetype})`);
    console.log(`Extname check: ${extname}, Mimetype check: ${mimetype}`);

    // If extension is missing (e.g. "blob" or generic name from compression), 
    // we rely on mimetype. Otherwise, we check both.
    if (mimetype && (extname || !path.extname(file.originalname))) {
        return cb(null, true);
    } else {
        cb(new Error('Images only!'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter
});

module.exports = upload;
