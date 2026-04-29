const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  educationLevel: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  rating: {
    type: Number,
    default: 0,
  },
  reviews: {
    type: Number,
    default: 0,
  },
  downloads: {
    type: Number,
    default: 0,
  },
  pages: {
    type: Number,
    required: true,
  },
  isHandwritten: {
    type: Boolean,
    default: false,
  },
  hasDigitalized: {
    type: Boolean,
    default: false,
  },
  thumbnail: {
    type: String,
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  tags: {
    type: [String],
    default: [],
  },
  isTextbook: {
    type: Boolean,
    default: false,
  },
  userReviews: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
  }],
}, {
  timestamps: true
});

// Text index for search
noteSchema.index({ title: 'text', description: 'text', tags: 'text' });
// Index for common queries
noteSchema.index({ subject: 1, educationLevel: 1 });
noteSchema.index({ sellerId: 1 });
noteSchema.index({ downloads: -1 });
noteSchema.index({ isTextbook: 1, price: 1 });

module.exports = mongoose.model('Note', noteSchema);
