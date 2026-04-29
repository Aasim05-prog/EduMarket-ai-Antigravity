const User = require('../models/User');

// @desc    Get user public profile by username
// @route   GET /api/users/:username
// @access  Public
const getUserByUsername = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-passwordHash');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      educationLevel: user.educationLevel,
      bio: user.bio,
      avatar: user.avatar,
      notesUploaded: user.notesUploaded,
      totalDownloads: user.totalDownloads,
      rating: user.rating,
      createdAt: user.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update current user's profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const allowedUpdates = ['fullName', 'bio', 'educationLevel', 'avatar'];
    const updates = {};

    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    // Handle avatar file upload
    if (req.file) {
      updates.avatar = `/uploads/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true })
      .select('-passwordHash');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      educationLevel: user.educationLevel,
      bio: user.bio,
      avatar: user.avatar,
      notesUploaded: user.notesUploaded,
      totalDownloads: user.totalDownloads,
      rating: user.rating,
      purchasedNotes: user.purchasedNotes,
      createdAt: user.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search users by name or username
// @route   GET /api/users/search
// @access  Public
const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    const users = await User.find({
      $or: [
        { fullName: { $regex: q, $options: 'i' } },
        { username: { $regex: q, $options: 'i' } },
      ],
    })
      .select('fullName username avatar educationLevel rating notesUploaded')
      .limit(20);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUserByUsername,
  updateProfile,
  searchUsers,
};
