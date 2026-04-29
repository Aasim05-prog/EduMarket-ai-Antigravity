const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  noteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Note',
    default: null,
  },
  lastMessage: {
    type: String,
    default: '',
  },
}, {
  timestamps: true
});

// Index for finding conversations by participant
conversationSchema.index({ participants: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);
