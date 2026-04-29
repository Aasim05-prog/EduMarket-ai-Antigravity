const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getConversations,
  getMessages,
  createOrGetConversation,
  sendMessage,
} = require('../controllers/chatController');

// All chat routes are protected
router.get('/', protect, getConversations);
router.post('/', protect, createOrGetConversation);
router.get('/:conversationId', protect, getMessages);
router.post('/:conversationId/message', protect, sendMessage);

module.exports = router;
