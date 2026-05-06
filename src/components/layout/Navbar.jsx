import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationsAPI } from '../../context/api';
import { getInitials, getAvatarColor } from '../../data/mockData';

// ─── Notification Bell Component ─────────────────────────────────────────────
const NotificationBell = ({ socket }) => {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropRef = useRef(null);
  const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const [notifs, { count }] = await Promise.all([
        notificationsAPI.getAll(),
        notificationsAPI.getUnreadCount(),
      ]);
      setNotifications(notifs || []);
      setUnread(count || 0);
    } catch { /* not logged in */ }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  // Real-time: listen for new notifications from socket
  useEffect(() => {
    if (!socket) return;
    const handleNew = (notif) => {
      setNotifications(prev => [notif, ...prev]);
      setUnread(prev => prev + 1);
    };
    socket.on('newNotification', handleNew);
    return () => socket.off('newNotification', handleNew);
  }, [socket]);

  const handleOpen = async () => {
    setOpen(!open);
    if (!open && unread > 0) {
      // Mark all as read on open
      try {
        await notificationsAPI.markAllRead();
        setUnread(0);
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      } catch {}
    }
  };

  const handleClick = (notif) => {
    setOpen(false);
    if (notif.link) navigate(notif.link);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    await notificationsAPI.delete(id);
    setNotifications(prev => prev.filter(n => n._id !== id));
  };

  const ICONS = { purchase: '💰', message: '💬', review: '⭐', system: '📢' };

  const timeAgo = (date) => {
    const s = Math.floor((Date.now() - new Date(date)) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  };

  return (
    <div ref={dropRef} style={{ position: 'relative' }}>
      <button
        onClick={handleOpen}
        id="notification-bell"
        style={{
          position: 'relative', background: 'none', border: 'none',
          cursor: 'pointer', padding: '6px 8px', borderRadius: 'var(--border-radius-md)',
          transition: 'background var(--transition-fast)',
          fontSize: '1.2rem', display: 'flex', alignItems: 'center',
        }}
        title="Notifications"
      >
        🔔
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: '2px', right: '2px',
            background: '#ef4444', color: 'white', borderRadius: '50%',
            width: '18px', height: '18px', fontSize: '0.65rem', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid white', lineHeight: 1,
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="animate-slide-down notification-dropdown" style={{
          position: 'absolute', top: 'calc(100% + 12px)', right: 0,
          width: '360px', maxHeight: '480px', overflowY: 'auto',
          background: '#fff', border: '1px solid var(--border-medium)',
          borderRadius: 'var(--border-radius-xl)', boxShadow: 'var(--shadow-lg)',
          zIndex: 'var(--z-dropdown)',
        }}>
          {/* Header */}
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>🔔 Notifications</h3>
            {notifications.length > 0 && (
              <button
                onClick={async () => { await notificationsAPI.markAllRead(); setUnread(0); setNotifications(prev => prev.map(n => ({ ...n, isRead: true }))); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--brand-primary)', fontWeight: 600 }}
              >Mark all read</button>
            )}
          </div>

          {/* List */}
          {notifications.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔔</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>You're all caught up!</p>
            </div>
          ) : (
            <div>
              {notifications.map(notif => (
                <div
                  key={notif._id}
                  onClick={() => handleClick(notif)}
                  style={{
                    padding: '0.875rem 1.25rem', cursor: notif.link ? 'pointer' : 'default',
                    background: notif.isRead ? 'transparent' : 'rgba(108,99,255,0.04)',
                    borderBottom: '1px solid var(--border-subtle)',
                    display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                    transition: 'background var(--transition-fast)',
                  }}
                >
                  <div style={{ fontSize: '1.4rem', flexShrink: 0, marginTop: '2px' }}>
                    {ICONS[notif.type] || '📢'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: '0.825rem', fontWeight: notif.isRead ? 500 : 700, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                      {notif.title}
                    </p>
                    <p style={{ margin: '3px 0 0', fontSize: '0.775rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      {notif.body}
                    </p>
                    <p style={{ margin: '4px 0 0', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {timeAgo(notif.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, notif._id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.9rem', padding: '2px 4px', opacity: 0.5, flexShrink: 0 }}
                    title="Dismiss"
                  >✕</button>
                  {!notif.isRead && (
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--brand-primary)', flexShrink: 0, marginTop: '6px' }} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Main Navbar ──────────────────────────────────────────────────────────────
const Navbar = ({ socket }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <header style={{ position: 'fixed', top: '1rem', left: 0, right: 0, zIndex: 'var(--z-sticky)', padding: '0 var(--space-6)', pointerEvents: 'none' }}>
      <div className="container flex items-center justify-between"
        style={{
          padding: '0.75rem 1.5rem', pointerEvents: 'auto',
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--border-radius-full)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        }}>

        <Link to="/" className="text-xl font-extrabold text-gradient" style={{ letterSpacing: '-0.5px' }}>
          EduMarket
        </Link>

        {/* Desktop Nav */}
        <nav className="flex items-center gap-6 hide-mobile">
          <Link to="/" className="text-sm font-medium text-muted hover:text-primary" style={{ transition: 'color var(--transition-base)' }}>Home</Link>
          <Link to="/browse" className="text-sm font-medium text-muted hover:text-primary" style={{ transition: 'color var(--transition-base)' }}>Browse Notes</Link>
          {isAuthenticated && (
            <>
              <Link to="/upload" className="text-sm font-medium text-muted hover:text-primary" style={{ transition: 'color var(--transition-base)' }}>Upload</Link>
              <Link to="/chat" className="text-sm font-medium text-muted hover:text-primary" style={{ transition: 'color var(--transition-base)' }}>Chat</Link>
            </>
          )}
        </nav>

        <div className="flex gap-2 items-center">
          {isAuthenticated && user ? (
            <>
              {/* Notification Bell */}
              <NotificationBell socket={socket} />

              {/* User menu */}
              <div ref={menuRef} style={{ position: 'relative' }}>
                <button onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                  <div className="avatar avatar-sm" style={{ background: getAvatarColor(user.username), width: '32px', height: '32px', fontSize: '0.65rem' }}>
                    {getInitials(user.fullName)}
                  </div>
                  <span className="text-sm font-medium hide-mobile">{user.fullName?.split(' ')[0]}</span>
                </button>

                {menuOpen && (
                  <div className="animate-slide-down" style={{
                    position: 'absolute', top: 'calc(100% + 12px)', right: 0,
                    minWidth: '220px', padding: 'var(--space-2)', zIndex: 'var(--z-dropdown)',
                    background: '#fff', border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--border-radius-xl)', boxShadow: 'var(--shadow-lg)',
                  }}>
                    <div style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--border-subtle)' }}>
                      <p className="font-bold text-sm">{user.fullName}</p>
                      <p className="text-xs text-muted">@{user.username}</p>
                      <p className="text-xs text-muted mt-1">{user.educationLevel}</p>
                    </div>
                    <div className="flex flex-col" style={{ padding: 'var(--space-2) 0' }}>
                      <Link to={`/profile/${user.username}`} className="nav-dropdown-item" onClick={() => setMenuOpen(false)}>👤 My Profile</Link>
                      <Link to="/dashboard" className="nav-dropdown-item" onClick={() => setMenuOpen(false)}>📊 Dashboard</Link>
                      <Link to="/upload" className="nav-dropdown-item" onClick={() => setMenuOpen(false)}>📤 Upload Notes</Link>
                      <Link to="/chat" className="nav-dropdown-item" onClick={() => setMenuOpen(false)}>💬 Messages</Link>
                    </div>
                    <div style={{ borderTop: '1px solid var(--border-subtle)', padding: 'var(--space-2) 0' }}>
                      <button className="nav-dropdown-item" onClick={handleLogout} style={{ width: '100%', textAlign: 'left', color: '#ef4444' }}>🚪 Logout</button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
              <Link to="/login" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button className="btn btn-ghost btn-sm hide-desktop" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ fontSize: '1.2rem', padding: '4px 8px' }}>
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="container animate-slide-down hide-desktop" style={{
          marginTop: '8px', padding: 'var(--space-4)', pointerEvents: 'auto',
          background: '#fff', border: '1px solid var(--border-medium)',
          borderRadius: 'var(--border-radius-xl)', boxShadow: 'var(--shadow-lg)',
        }}>
          <div className="flex flex-col gap-3">
            <Link to="/" className="text-sm font-medium p-2" onClick={() => setMobileMenuOpen(false)}>🏠 Home</Link>
            <Link to="/browse" className="text-sm font-medium p-2" onClick={() => setMobileMenuOpen(false)}>📚 Browse Notes</Link>
            {isAuthenticated && (
              <>
                <Link to="/upload" className="text-sm font-medium p-2" onClick={() => setMobileMenuOpen(false)}>📤 Upload</Link>
                <Link to="/chat" className="text-sm font-medium p-2" onClick={() => setMobileMenuOpen(false)}>💬 Chat</Link>
                <Link to="/dashboard" className="text-sm font-medium p-2" onClick={() => setMobileMenuOpen(false)}>📊 Dashboard</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
