import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { chatAPI } from '../context/api';
import { getSocket, joinRoom, leaveRoom, sendSocketMessage, emitTyping } from '../context/socket';
import { getInitials, getAvatarColor } from '../data/mockData';
import ChatBubble from '../components/ui/ChatBubble';

const REPLIES = [
  "Thanks for reaching out! Let me check on that.",
  "Sure, I can help you with that!",
  "That's a great question. Let me think about it.",
  "I appreciate your interest in my notes!",
  "Would you like a preview before purchasing?",
  "I can offer a small discount if you buy multiple notes.",
];

const ChatPage = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const [convs, setConvs] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState('');
  const [showList, setShowList] = useState(!userId);
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msgsLoading, setMsgsLoading] = useState(false);
  const endRef = useRef(null);
  const socketRef = useRef(null);
  const prevRoomRef = useRef(null);

  // Load conversations on mount
  useEffect(() => {
    const loadConversations = async () => {
      setLoading(true);
      try {
        const data = await chatAPI.getConversations();
        setConvs(data || []);
      } catch (err) {
        console.error('Failed to load conversations:', err);
        setConvs([]);
      }
      setLoading(false);
    };
    loadConversations();
  }, []);

  // Handle userId param (start or open conversation with a user)
  useEffect(() => {
    if (!userId || loading) return;

    const initConversation = async () => {
      try {
        const conv = await chatAPI.createOrGet(userId);
        if (conv._id) {
          setConvs(prev => {
            const exists = prev.find(c => c._id === conv._id);
            if (!exists) return [...prev, { _id: conv._id, partner: conv.partner, lastMessage: null }];
            return prev.map(c => c._id === conv._id ? { ...c, partner: conv.partner || c.partner } : c);
          });
          setActiveChat(conv._id);
          setShowList(false);
        }
      } catch (err) {
        console.warn('Failed to create conversation:', err);
      }
    };
    initConversation();
  }, [userId, loading]);

  // Load messages when active chat changes
  useEffect(() => {
    if (!activeChat) return;

    const loadMessages = async () => {
      setMsgsLoading(true);
      try {
        const data = await chatAPI.getMessages(activeChat);
        setMessages(data || []);
      } catch {
        setMessages([]);
      }
      setMsgsLoading(false);
    };
    loadMessages();

    // Socket.io: join room
    if (prevRoomRef.current) leaveRoom(prevRoomRef.current);
    joinRoom(activeChat);
    prevRoomRef.current = activeChat;
  }, [activeChat]);

  // Socket.io: listen for new messages
  useEffect(() => {

    const socket = getSocket();
    if (!socket) return;
    socketRef.current = socket;

    const handleNewMessage = (msg) => {
      if (msg.conversationId === activeChat) {
        setMessages(prev => {
          // Prevent duplicates
          if (prev.find(m => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }
      // Update last message in conversation list
      setConvs(prev => prev.map(c =>
        c._id === msg.conversationId
          ? { ...c, lastMessage: { text: msg.text, senderId: msg.senderId, createdAt: msg.createdAt } }
          : c
      ));
    };

    const handleTyping = ({ userId: typingUserId, isTyping }) => {
      if (typingUserId !== (user?._id || user?.id)) {
        setTyping(isTyping);
      }
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('userTyping', handleTyping);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('userTyping', handleTyping);
    };
  }, [activeChat, user]);

  // Auto scroll to bottom
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  // Get partner info for active conversation
  const getPartner = useCallback((conv) => {
    return conv?.partner || null;
  }, []);

  const activeConv = convs.find(c => (c._id || c.id) === activeChat);
  const partner = getPartner(activeConv);

  const send = async () => {
    if (!msgInput.trim() || !activeChat) return;
    const text = msgInput.trim();
    setMsgInput('');
    emitTyping(activeChat, false); // stop typing indicator when message sent

    // Try socket first (real-time), then REST fallback
    const socketSent = sendSocketMessage(activeChat, text);
    if (!socketSent) {
      try {
        const msg = await chatAPI.sendMessage(activeChat, text);
        setMessages(prev => {
          if (prev.find(m => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      } catch (err) {
        console.error('Failed to send message:', err);
      }
    }
  };

  const typingTimeoutRef = useRef(null);
  const handleInputChange = (e) => {
    setMsgInput(e.target.value);
    if (!activeChat) return;
    emitTyping(activeChat, true);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => emitTyping(activeChat, false), 2000);
  };

  const partnerName = partner?.fullName || 'User';
  const partnerUsername = partner?.username || '';
  const partnerIsOnline = partner?.isOnline ?? false;
  const currentUserId = user?._id || user?.id;

  return (
    <div className="container min-h-screen" style={{ paddingTop: '10vh', paddingBottom: 'var(--space-8)' }}>
      <div className="chat-layout card animate-fade-in" style={{ height: 'calc(100vh - 140px)', overflow: 'hidden', border: '1px solid var(--border-medium)' }}>
        {/* Sidebar */}
        <div className={`chat-sidebar ${showList ? 'show-mobile' : ''}`} style={{ background: 'var(--bg-surface)', borderRight: '1px solid var(--border-subtle)' }}>
          <div className="chat-sidebar-header" style={{ background: '#fff', borderBottom: '1px solid var(--border-subtle)', padding: '1.25rem 1.5rem' }}>
            <h2 className="font-bold text-xl" style={{ color: 'var(--text-primary)' }}>💬 Messages</h2>
          </div>
          <div className="chat-list" style={{ overflowY: 'auto', flex: 1 }}>
            {loading ? (
              <div className="p-4 flex flex-col gap-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0 }}></div>
                    <div style={{ flex: 1 }}>
                      <div className="skeleton" style={{ height: '14px', width: '60%', marginBottom: '6px' }}></div>
                      <div className="skeleton" style={{ height: '12px', width: '90%' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : convs.length === 0 ? (
              <div className="text-center p-6">
                <span className="text-3xl block mb-2">💬</span>
                <p className="text-muted text-sm">No conversations yet</p>
                <p className="text-xs text-muted mt-2">Visit a seller's profile to start chatting!</p>
              </div>
            ) : convs.map(conv => {
              const p = getPartner(conv);
              if (!p) return null;
              const last = conv.lastMessage;
              const isActive = activeChat === (conv._id || conv.id);
              return (
                <button 
                  key={conv._id || conv.id} 
                  className={`chat-list-item ${isActive ? 'active' : ''}`} 
                  onClick={() => { setActiveChat(conv._id || conv.id); setShowList(false); }}
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '12px', 
                    width: '100%', padding: '14px 16px', border: 'none', cursor: 'pointer',
                    background: isActive ? 'rgba(108, 99, 255, 0.08)' : 'transparent',
                    borderLeft: isActive ? '3px solid var(--brand-primary)' : '3px solid transparent',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <div className="avatar" style={{ background: getAvatarColor(p.username), flexShrink: 0 }}>{getInitials(p.fullName)}</div>
                  <div className="flex flex-col" style={{ overflow: 'hidden', flex: 1, textAlign: 'left' }}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{p.fullName}</span>
                    </div>
                    {last && <span className="text-xs text-muted truncate mt-1">{last.senderId === currentUserId || last.senderId === 'currentUser' ? 'You: ' : ''}{last.text}</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="chat-main" style={{ display: 'flex', flexDirection: 'column', background: '#fff' }}>
          {activeConv && partner ? (
            <>
              {/* Chat Header */}
              <div className="chat-header" style={{ 
                padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)', 
                background: '#fff', display: 'flex', alignItems: 'center', gap: '12px'
              }}>
                <button className="btn btn-ghost btn-sm hide-desktop" onClick={() => setShowList(true)} style={{ marginRight: '4px', fontSize: '1rem' }}>←</button>
                <Link to={`/profile/${partnerUsername}`} className="flex items-center gap-3" style={{ textDecoration: 'none' }}>
                  <div className="avatar avatar-sm" style={{ background: getAvatarColor(partnerUsername) }}>{getInitials(partnerName)}</div>
                  <div>
                    <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{partnerName}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs" style={{ color: '#10B981' }}>● Online</span>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Messages */}
              <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: '20px', background: 'var(--bg-surface)' }}>
                {msgsLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="flex flex-col items-center gap-3">
                      <div className="animate-spin" style={{ width: '32px', height: '32px', border: '3px solid var(--border-medium)', borderTopColor: 'var(--brand-primary)', borderRadius: '50%' }}></div>
                      <span className="text-sm text-muted">Loading messages...</span>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.length === 0 && (
                      <div className="text-center" style={{ padding: 'var(--space-12)' }}>
                        <div className="avatar avatar-xl" style={{ background: getAvatarColor(partnerUsername), margin: '0 auto var(--space-4)' }}>{getInitials(partnerName)}</div>
                        <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{partnerName}</h3>
                        <p className="text-xs text-muted mt-4">Send a message to start the conversation!</p>
                      </div>
                    )}
                    {messages.map(m => {
                      const isOwn = (m.senderId?._id || m.senderId) === currentUserId;
                      const senderName = !isOwn ? (m.senderId?.fullName || partnerName) : null;
                      return (
                        <ChatBubble 
                          key={m._id || m.id} 
                          message={m.text} 
                          isOwn={isOwn} 
                          senderName={senderName} 
                          timestamp={m.createdAt || m.timestamp} 
                        />
                      );
                    })}
                    {typing && (
                      <div className="flex items-center gap-2 animate-fade-in" style={{ padding: '8px 0' }}>
                        <div className="avatar" style={{ background: getAvatarColor(partnerUsername), width: '28px', height: '28px', fontSize: '0.6rem' }}>{getInitials(partnerName)}</div>
                        <div style={{ 
                          background: 'var(--bg-elevated)', borderRadius: '16px', padding: '10px 16px',
                          display: 'flex', gap: '4px', alignItems: 'center'
                        }}>
                          <span className="typing-dot" style={{ animationDelay: '0s' }}></span>
                          <span className="typing-dot" style={{ animationDelay: '0.15s' }}></span>
                          <span className="typing-dot" style={{ animationDelay: '0.3s' }}></span>
                        </div>
                      </div>
                    )}
                    <div ref={endRef} />
                  </>
                )}
              </div>

              {/* Input */}
              <div className="chat-input-bar" style={{ 
                padding: '14px 20px', borderTop: '1px solid var(--border-subtle)', 
                background: '#fff', display: 'flex', gap: '10px', alignItems: 'center'
              }}>
                <input type="text" className="input" placeholder="Type a message..."
                  value={msgInput}
                  onChange={handleInputChange}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); send(); } }}
                  style={{ flex: 1, borderRadius: 'var(--border-radius-full)', padding: '0.75rem 1.25rem' }}
                />
                <button className="btn btn-primary" onClick={send} disabled={!msgInput.trim()}
                  style={{ borderRadius: 'var(--border-radius-full)', padding: '0.75rem 1.25rem' }}>
                  Send →
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center" style={{ padding: 'var(--space-8)' }}>
              <span style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>💬</span>
              <h2 className="font-bold text-2xl mb-2" style={{ color: 'var(--text-primary)' }}>Select a Conversation</h2>
              <p className="text-muted text-sm">Choose from the sidebar or visit a seller's profile to start chatting.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
