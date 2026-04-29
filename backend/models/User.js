const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  educationLevel: {
    type: String,
    required: true,
  },
  bio: {
    type: String,
    default: '',
  },
  avatar: {
    type: String,
    default: null,
  },
  notesUploaded: {
    type: Number,
    default: 0,
  },
  totalDownloads: {
    type: Number,
    default: 0,
  },
  rating: {
    type: Number,
    default: 0,
  },
  purchasedNotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Note',
  }],
}, {
  timestamps: true // Gives us createdAt and updatedAt
});

module.exports = mongoose.model('User', userSchema);
