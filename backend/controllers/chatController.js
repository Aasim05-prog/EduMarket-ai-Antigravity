const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const { createAndEmit } = require('./notificationController');

// @desc    Get all conversations for the current user
// @route   GET /api/chat
// @access  Private
const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate('participants', 'fullName username avatar')
      .populate('noteId', 'title price')
      .sort({ updatedAt: -1 });

    // Build response with last message and partner info
    const response = await Promise.all(
      conversations.map(async (conv) => {
        const lastMsg = await Message.findOne({ conversationId: conv._id })
          .sort({ createdAt: -1 });

        // Find the other participant (not the current user)
        const partner = conv.participants.find(
          p => p._id.toString() !== req.user._id.toString()
        );

        return {
          _id: conv._id,
          partner,
          noteId: conv.noteId,
          lastMessage: lastMsg ? {
            text: lastMsg.text,
            senderId: lastMsg.senderId,
            createdAt: lastMsg.createdAt,
          } : null,
          updatedAt: conv.updatedAt,
        };
      })
    );

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get messages for a conversation
// @route   GET /api/chat/:conversationId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Check if user is a participant
    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to view this conversation' });
    }

    const messages = await Message.find({ conversationId: req.params.conversationId })
      .populate('senderId', 'fullName username avatar')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new conversation or get existing one
// @route   POST /api/chat
// @access  Private
const createOrGetConversation = async (req, res) => {
  try {
    const { participantId, noteId } = req.body;

    if (!participantId) {
      return res.status(400).json({ message: 'participantId is required' });
    }

    if (participantId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot create conversation with yourself' });
    }

    // Check if a conversation already exists between the two users
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, participantId] },
    }).populate('participants', 'fullName username avatar');

    if (conversation) {
      const partner = conversation.participants.find(
        p => p._id.toString() !== req.user._id.toString()
      );
      return res.json({ _id: conversation._id, partner });
    }

    // Create new conversation
    conversation = await Conversation.create({
      participants: [req.user._id, participantId],
      noteId: noteId || null,
    });

    conversation = await conversation.populate('participants', 'fullName username avatar');

    const partner = conversation.participants.find(
      p => p._id.toString() !== req.user._id.toString()
    );

    res.status(201).json({ _id: conversation._id, partner });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send a message in a conversation (REST fallback)
// @route   POST /api/chat/:conversationId/message
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const { conversationId } = req.params;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Message text is required' });
    }

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const message = await Message.create({
      conversationId,
      senderId: req.user._id,
      text: text.trim(),
    });

    // Update conversation timestamp
    conversation.lastMessage = text.trim();
    await conversation.save();

    const populated = await message.populate('senderId', 'fullName username avatar');

    // Notify the other participant
    const recipientId = conversation.participants.find(
      p => p.toString() !== req.user._id.toString()
    );
    if (recipientId) {
      const sender = await User.findById(req.user._id).select('fullName');
      await createAndEmit({
        recipientId,
        actorId: req.user._id,
        type: 'message',
        title: '💬 New message',
        body: `${sender?.fullName || 'Someone'}: ${text.trim().slice(0, 60)}${text.length > 60 ? '...' : ''}`,
        link: `/chat/${req.user._id}`,
      });
    }

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getConversations,
  getMessages,
  createOrGetConversation,
  sendMessage,
};
