const Notification = require('../models/Notification');

// ─── Helper: create + emit a notification ────────────────────────────────────
// Called internally by other controllers (purchase, chat, review)
let _io = null;
const setIO = (io) => { _io = io; };

const createAndEmit = async ({ recipientId, actorId, type, title, body, link = '' }) => {
  try {
    if (recipientId?.toString() === actorId?.toString()) return; // Don't notify yourself
    const notif = await Notification.create({ recipientId, actorId, type, title, body, link });
    // Real-time push via Socket.io to recipient's personal room
    if (_io) {
      _io.to(`user_${recipientId}`).emit('newNotification', {
        _id: notif._id,
        type: notif.type,
        title: notif.title,
        body: notif.body,
        link: notif.link,
        isRead: false,
        createdAt: notif.createdAt,
      });
    }
    return notif;
  } catch (err) {
    console.error('Failed to create notification:', err.message);
  }
};

// @desc    Get all notifications for logged-in user
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipientId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('actorId', 'fullName username avatar');
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ recipientId: req.user._id, isRead: false });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark one notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientId: req.user._id },
      { isRead: true }
    );
    res.json({ message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark ALL notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipientId: req.user._id, isRead: false }, { isRead: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, recipientId: req.user._id });
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getNotifications, getUnreadCount, markRead, markAllRead, deleteNotification, createAndEmit, setIO };
