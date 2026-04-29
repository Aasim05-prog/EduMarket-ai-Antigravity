const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const {
  getUserByUsername,
  updateProfile,
  searchUsers,
} = require('../controllers/userController');

// Public routes
router.get('/search', searchUsers);
router.get('/:username', getUserByUsername);

// Protected routes
router.put('/profile', protect, upload.single('avatar'), updateProfile);

module.exports = router;
