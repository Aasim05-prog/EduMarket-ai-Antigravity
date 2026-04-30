const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { upload, uploadToCloudinary } = require('../middleware/upload');
const {
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  getNotesBySeller,
  purchaseNote,
  getPurchasedNotes,
  reviewNote,
  getNoteReviews,
} = require('../controllers/noteController');

// Public routes
router.get('/', getAllNotes);
router.get('/seller/:sellerId', getNotesBySeller);

// Protected routes (must be before /:id to avoid ObjectId conflict)
router.get('/purchased', protect, getPurchasedNotes);

router.get('/:id', getNoteById);

// Protected routes
router.post(
  '/',
  protect,
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'file', maxCount: 1 },
  ]),
  uploadToCloudinary,
  createNote
);

router.put(
  '/:id',
  protect,
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'file', maxCount: 1 },
  ]),
  uploadToCloudinary,
  updateNote
);

router.delete('/:id', protect, deleteNote);
router.post('/:id/purchase', protect, purchaseNote);
router.post('/:id/review', protect, reviewNote);
router.get('/:id/reviews', getNoteReviews);

module.exports = router;
