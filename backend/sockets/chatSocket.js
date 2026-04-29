const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

const setupChatSocket = (io) => {
  // Authenticate socket connections via JWT
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication error: No token'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} (user: ${socket.userId})`);

    // Join personal room for targeted notifications
    socket.join(`user_${socket.userId}`);

    // Join a conversation room
    socket.on('joinRoom', (conversationId) => {
      socket.join(conversationId);
      console.log(`User ${socket.userId} joined room ${conversationId}`);
    });

    // Leave a conversation room
    socket.on('leaveRoom', (conversationId) => {
      socket.leave(conversationId);
    });

    // Send a message via socket
    socket.on('sendMessage', async ({ conversationId, text }) => {
      try {
        if (!text || !text.trim() || !conversationId) return;

        // Verify user is part of the conversation
        const conversation = await Conversation.findById(conversationId);
        if (!conversation || !conversation.participants.includes(socket.userId)) {
          socket.emit('error', { message: 'Not authorized' });
          return;
        }

        // Save message to DB
        const message = await Message.create({
          conversationId,
          senderId: socket.userId,
          text: text.trim(),
        });

        // Update conversation timestamp & lastMessage
        conversation.lastMessage = text.trim();
        await conversation.save();

        const populated = await message.populate('senderId', 'fullName username avatar');

        // Broadcast to all users in the room (including sender)
        io.to(conversationId).emit('newMessage', {
          _id: populated._id,
          conversationId: populated.conversationId,
          senderId: populated.senderId,
          text: populated.text,
          createdAt: populated.createdAt,
        });
      } catch (err) {
        console.error('Socket sendMessage error:', err);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing', ({ conversationId, isTyping }) => {
      socket.to(conversationId).emit('userTyping', {
        userId: socket.userId,
        isTyping,
      });
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = setupChatSocket;
