const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary from env vars
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary storage for images (thumbnails)
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'edumarket/thumbnails',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 600, crop: 'limit', quality: 'auto' }],
    public_id: `thumbnail-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
  }),
});

// Cloudinary storage for PDFs (raw upload)
const pdfStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'edumarket/files',
    allowed_formats: ['pdf'],
    resource_type: 'raw',
    public_id: `file-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
  }),
});

// File filter — accept images and PDFs
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
    'application/pdf',
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, WebP images and PDF files are allowed'), false);
  }
};

// Use different storage based on file field name
const storage = multer.diskStorage({}); // fallback (not used)

const upload = multer({
  storage: multer.memoryStorage(), // temp memory, replaced by Cloudinary
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
});

// Custom middleware that routes to correct Cloudinary storage per field
const uploadToCloudinary = async (req, res, next) => {
  if (!req.files) return next();

  try {
    const uploadPromises = [];

    if (req.files.thumbnail && req.files.thumbnail[0]) {
      const file = req.files.thumbnail[0];
      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'edumarket/thumbnails',
            transformation: [{ width: 800, height: 600, crop: 'limit', quality: 'auto' }],
            public_id: `thumbnail-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
          },
          (error, result) => {
            if (error) return reject(error);
            req.files.thumbnail[0].cloudinaryUrl = result.secure_url;
            req.files.thumbnail[0].cloudinaryPublicId = result.public_id;
            resolve(result);
          }
        );
        uploadStream.end(file.buffer);
      });
      uploadPromises.push(uploadPromise);
    }

    if (req.files.file && req.files.file[0]) {
      const file = req.files.file[0];
      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'edumarket/files',
            resource_type: 'raw',
            public_id: `file-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
          },
          (error, result) => {
            if (error) return reject(error);
            req.files.file[0].cloudinaryUrl = result.secure_url;
            req.files.file[0].cloudinaryPublicId = result.public_id;
            resolve(result);
          }
        );
        uploadStream.end(file.buffer);
      });
      uploadPromises.push(uploadPromise);
    }

    await Promise.all(uploadPromises);
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { upload, uploadToCloudinary };
