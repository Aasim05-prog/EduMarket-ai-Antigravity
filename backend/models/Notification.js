const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['purchase', 'message', 'review', 'system'],
    required: true,
  },
  title: { type: String, required: true },
  body: { type: String, required: true },
  link: { type: String, default: '' },   // e.g. /note/:id or /chat/:userId
  isRead: { type: Boolean, default: false },
  actorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
}, { timestamps: true });

// Auto-delete notifications older than 30 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

module.exports = mongoose.model('Notification', notificationSchema);
