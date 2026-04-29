// ============================================================
// EDUMARKET — SOCKET.IO CLIENT
// Provides socket connection and useSocket hook
// ============================================================

import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;

// Get or create socket connection
export const getSocket = () => {
  if (socket && socket.connected) return socket;

  const userData = localStorage.getItem('edumarket_user');
  if (!userData) return null;

  try {
    const { token } = JSON.parse(userData);
    if (!token) return null;

    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.warn('Socket connection error:', err.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    return socket;
  } catch {
    return null;
  }
};

// Disconnect socket
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Join a conversation room
export const joinRoom = (conversationId) => {
  const s = getSocket();
  if (s) s.emit('joinRoom', conversationId);
};

// Leave a conversation room
export const leaveRoom = (conversationId) => {
  const s = getSocket();
  if (s) s.emit('leaveRoom', conversationId);
};

// Send a message via socket
export const sendSocketMessage = (conversationId, text) => {
  const s = getSocket();
  if (s) {
    s.emit('sendMessage', { conversationId, text });
    return true;
  }
  return false;
};

// Emit typing indicator
export const emitTyping = (conversationId, isTyping) => {
  const s = getSocket();
  if (s) s.emit('typing', { conversationId, isTyping });
};

export default { getSocket, disconnectSocket, joinRoom, leaveRoom, sendSocketMessage, emitTyping };
