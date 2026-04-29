const Note = require('../models/Note');
const User = require('../models/User');
const { createAndEmit } = require('./notificationController');

// @desc    Get all notes (with search, filter, sort, pagination)
// @route   GET /api/notes
// @access  Public
const getAllNotes = async (req, res) => {
  try {
    const {
      search, subject, educationLevel, isTextbook,
      sort = 'popular', page = 1, limit = 20,
    } = req.query;

    const query = {};

    // Text search across title, description, tags
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    if (subject && subject !== 'All') {
      query.subject = subject;
    }

    if (educationLevel && educationLevel !== 'All') {
      query.educationLevel = educationLevel;
    }

    // Filter free textbooks
    if (isTextbook === 'true') {
      query.isTextbook = true;
    }

    // Sort options
    let sortOption = {};
    switch (sort) {
      case 'newest': sortOption = { createdAt: -1 }; break;
      case 'popular': sortOption = { downloads: -1 }; break;
      case 'rating': sortOption = { rating: -1 }; break;
      case 'price_low': sortOption = { price: 1 }; break;
      case 'price_high': sortOption = { price: -1 }; break;
      default: sortOption = { downloads: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [notes, total] = await Promise.all([
      Note.find(query)
        .populate('sellerId', 'fullName username avatar rating notesUploaded')
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit)),
      Note.countDocuments(query),
    ]);

    res.json({
      notes,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single note by ID
// @route   GET /api/notes/:id
// @access  Public
const getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate('sellerId', 'fullName username avatar rating notesUploaded totalDownloads bio educationLevel isOnline createdAt');

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json(note);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new note (with file upload)
// @route   POST /api/notes
// @access  Private
const createNote = async (req, res) => {
  try {
    const {
      title, subject, educationLevel, description,
      price, pages, isHandwritten, hasDigitalized, tags,
    } = req.body;

    if (!title || !subject || !educationLevel || !description || !price || !pages) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    // Build file URLs from uploaded files
    let thumbnail = '';
    let fileUrl = '';

    if (req.files) {
      if (req.files.thumbnail && req.files.thumbnail[0]) {
        thumbnail = `/uploads/${req.files.thumbnail[0].filename}`;
      }
      if (req.files.file && req.files.file[0]) {
        fileUrl = `/uploads/${req.files.file[0].filename}`;
      }
    }

    // Fallback: if no thumbnail uploaded, use a placeholder
    if (!thumbnail) {
      thumbnail = 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80';
    }
    if (!fileUrl) {
      fileUrl = thumbnail; // Use thumbnail as fallback for now
    }

    // Parse tags from comma-separated string or JSON
    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = JSON.parse(tags);
      } catch {
        parsedTags = tags.split(',').map(t => t.trim()).filter(Boolean);
      }
    }

    const note = await Note.create({
      title,
      subject,
      educationLevel,
      description,
      sellerId: req.user._id,
      price: Number(price),
      pages: Number(pages),
      isHandwritten: isHandwritten === 'true' || isHandwritten === true,
      hasDigitalized: hasDigitalized === 'true' || hasDigitalized === true,
      thumbnail,
      fileUrl,
      tags: parsedTags,
    });

    // Increment seller's notesUploaded count
    await User.findByIdAndUpdate(req.user._id, { $inc: { notesUploaded: 1 } });

    const populated = await note.populate('sellerId', 'fullName username avatar rating');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a note
// @route   PUT /api/notes/:id
// @access  Private (owner only)
const updateNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Check ownership
    if (note.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this note' });
    }

    const allowedUpdates = ['title', 'subject', 'educationLevel', 'description', 'price', 'tags'];
    const updates = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    // Handle file updates
    if (req.files) {
      if (req.files.thumbnail && req.files.thumbnail[0]) {
        updates.thumbnail = `/uploads/${req.files.thumbnail[0].filename}`;
      }
      if (req.files.file && req.files.file[0]) {
        updates.fileUrl = `/uploads/${req.files.file[0].filename}`;
      }
    }

    const updated = await Note.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('sellerId', 'fullName username avatar rating');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private (owner only)
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (note.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this note' });
    }

    await note.deleteOne();

    // Decrement seller's notesUploaded count
    await User.findByIdAndUpdate(req.user._id, { $inc: { notesUploaded: -1 } });

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get notes by a specific seller
// @route   GET /api/notes/seller/:sellerId
// @access  Public
const getNotesBySeller = async (req, res) => {
  try {
    const notes = await Note.find({ sellerId: req.params.sellerId })
      .populate('sellerId', 'fullName username avatar rating')
      .sort({ createdAt: -1 });

    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Purchase a note
// @route   POST /api/notes/:id/purchase
// @access  Private
const purchaseNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const user = await User.findById(req.user._id);

    // Check if already purchased
    if (user.purchasedNotes.includes(note._id)) {
      return res.status(400).json({ message: 'Note already purchased' });
    }

    // Add to purchased notes
    user.purchasedNotes.push(note._id);
    await user.save();

    // Increment download count on note
    note.downloads += 1;
    await note.save();

    // Increment totalDownloads on seller
    await User.findByIdAndUpdate(note.sellerId, { $inc: { totalDownloads: 1 } });

    // Notify the seller about the purchase
    await createAndEmit({
      recipientId: note.sellerId,
      actorId: req.user._id,
      type: 'purchase',
      title: '💰 Someone bought your note!',
      body: `${user.fullName} purchased "${note.title}"`,
      link: `/note/${note._id}`,
    });

    res.json({ message: 'Note purchased successfully', noteId: note._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get currently logged-in user's purchased notes (full note docs)
// @route   GET /api/notes/purchased
// @access  Private
const getPurchasedNotes = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'purchasedNotes',
      populate: { path: 'sellerId', select: 'fullName username avatar rating notesUploaded' },
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user.purchasedNotes || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit a review (rating + comment) for a purchased note
// @route   POST /api/notes/:id/review
// @access  Private (must have purchased)
const reviewNote = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    const user = await User.findById(req.user._id);

    // Only allow review if user has purchased the note
    if (!user.purchasedNotes.includes(note._id)) {
      return res.status(403).json({ message: 'You must purchase this note before reviewing it' });
    }

    // Check if user already reviewed — update if so
    const existingIdx = note.userReviews ? note.userReviews.findIndex(
      r => r.userId.toString() === req.user._id.toString()
    ) : -1;

    if (!note.userReviews) note.userReviews = [];

    if (existingIdx >= 0) {
      note.userReviews[existingIdx] = { userId: req.user._id, rating, comment: comment?.trim() || '', createdAt: new Date() };
    } else {
      note.userReviews.push({ userId: req.user._id, rating, comment: comment?.trim() || '', createdAt: new Date() });
    }

    // Recalculate average rating
    const totalRating = note.userReviews.reduce((sum, r) => sum + r.rating, 0);
    note.rating = parseFloat((totalRating / note.userReviews.length).toFixed(1));
    note.reviews = note.userReviews.length;

    await note.save();

    // Notify the seller about the new review
    await createAndEmit({
      recipientId: note.sellerId,
      actorId: req.user._id,
      type: 'review',
      title: '⭐ New review on your note!',
      body: `${user.fullName} gave ${rating} star${rating > 1 ? 's' : ''} on "${note.title}"`,
      link: `/note/${note._id}`,
    });

    res.json({ message: 'Review submitted', rating: note.rating, reviews: note.reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all reviews for a note
// @route   GET /api/notes/:id/reviews
// @access  Public
const getNoteReviews = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate('userReviews.userId', 'fullName username avatar');

    if (!note) return res.status(404).json({ message: 'Note not found' });

    res.json(note.userReviews || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
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
};
