import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notesAPI } from '../context/api';
import { getInitials, getAvatarColor } from '../data/mockData';
import NoteCard from '../components/ui/NoteCard';

const Dashboard = () => {
  const { user, purchasedNotes } = useAuth();
  const [myNotes, setMyNotes] = useState([]);
  const [purchasedList, setPurchasedList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasedLoading, setPurchasedLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [activeTab, setActiveTab] = useState('uploaded'); // 'uploaded' | 'purchased'

  // Fetch uploaded notes
  useEffect(() => {
    const fetchUploaded = async () => {
      setLoading(true);
      try {
        if (user?.id || user?._id) {
          const sellerId = user._id || user.id;
          const notes = await notesAPI.getBySeller(sellerId);
          setMyNotes(notes || []);
        }
      } catch {
        setMyNotes([]);
      }
      setLoading(false);
    };
    if (user) fetchUploaded();
  }, [user]);

  // Fetch purchased notes from API
  useEffect(() => {
    const fetchPurchased = async () => {
      setPurchasedLoading(true);
      try {
        const notes = await notesAPI.getPurchased();
        setPurchasedList(notes || []);
      } catch {
        // Fallback: show just count from context
        setPurchasedList([]);
      }
      setPurchasedLoading(false);
    };
    if (user) fetchPurchased();
  }, [user]);

  const handleDelete = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    setDeletingId(noteId);
    try {
      await notesAPI.delete(noteId);
      setMyNotes(prev => prev.filter(n => (n._id || n.id) !== noteId));
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
    setDeletingId(null);
  };

  const totalDownloads = myNotes.reduce((sum, n) => sum + (n.downloads || 0), 0);
  const totalEarnings = myNotes.reduce((sum, n) => sum + ((n.price || 0) * (n.downloads || 0)), 0);

  return (
    <div className="container min-h-screen" style={{ paddingTop: '10vh', paddingBottom: 'var(--space-20)' }}>
      {/* Dashboard Header */}
      <div className="flex flex-wrap items-center justify-between gap-6 mb-12 animate-fade-in">
        <div className="flex items-center gap-4">
          <div className="avatar avatar-xl" style={{ background: getAvatarColor(user?.username || 'user'), fontSize: '1.5rem' }}>
            {getInitials(user?.fullName || 'User')}
          </div>
          <div>
            <h1 className="font-extrabold text-3xl mb-1">Welcome, <span className="text-gradient">{user?.fullName?.split(' ')[0]}!</span></h1>
            <p className="text-muted text-sm">@{user?.username} • {user?.educationLevel}</p>
          </div>
        </div>
        <div className="flex gap-4">
          <Link to="/upload" className="btn btn-primary">📤 Upload Notes</Link>
          <Link to="/browse" className="btn btn-secondary">📚 Browse Notes</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-6 mb-12 dashboard-stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        {[
          { label: 'Notes Uploaded', value: myNotes.length || (user?.notesUploaded || 0), gradient: 'text-gradient', icon: '📤', color: 'rgba(108, 99, 255, 0.06)', border: '#6C63FF' },
          { label: 'Notes Purchased', value: purchasedList.length || purchasedNotes.length, gradient: 'text-gradient-teal', icon: '📥', color: 'rgba(16, 185, 129, 0.06)', border: '#10B981' },
          { label: 'Total Downloads', value: (user?.totalDownloads || totalDownloads).toLocaleString(), gradient: 'text-gradient-coral', icon: '📊', color: 'rgba(255, 101, 132, 0.06)', border: '#FF6584' },
          { label: '💰 Total Earnings', value: `₹${totalEarnings.toLocaleString()}`, gradient: 'text-gradient-gold', icon: '💰', color: 'rgba(245, 158, 11, 0.06)', border: '#F59E0B', isText: false },
        ].map((stat, i) => (
          <div key={i} className="card p-6 animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s`, borderTop: `3px solid ${stat.border}`, background: stat.color }}>
            <div className="flex justify-between items-start">
              <div>
                <div className="text-muted text-xs font-semibold uppercase tracking-wider mb-2">{stat.label}</div>
                <div className={`font-black ${stat.isText ? 'text-lg' : 'text-3xl'} ${stat.gradient}`}>{stat.value}</div>
              </div>
              <span style={{ fontSize: '1.5rem' }}>{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 p-1 rounded-xl dashboard-tabs" style={{ background: 'var(--bg-elevated)', display: 'inline-flex', width: 'auto' }}>
        {[
          { id: 'uploaded', label: '📤 My Uploaded Notes', count: myNotes.length },
          { id: 'purchased', label: '📥 My Purchased Notes', count: purchasedList.length || purchasedNotes.length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`btn btn-sm ${activeTab === tab.id ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: 'var(--border-radius-lg)', transition: 'all var(--transition-base)' }}
          >
            {tab.label}
            <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold"
              style={{ background: activeTab === tab.id ? 'rgba(255,255,255,0.25)' : 'var(--border-medium)', color: activeTab === tab.id ? '#fff' : 'var(--text-muted)' }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* My Uploaded Notes */}
      {activeTab === 'uploaded' && (
        <section className="animate-fade-in">
          {loading ? (
            <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
              {[1, 2, 3].map(i => (
                <div key={i} className="card" style={{ height: '200px' }}>
                  <div className="skeleton" style={{ height: '100%' }}></div>
                </div>
              ))}
            </div>
          ) : myNotes.length > 0 ? (
            <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
              {myNotes.map((note, i) => (
                <div key={note._id || note.id || i} className="card p-5 animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s`, position: 'relative' }}>
                  {/* Thumbnail */}
                  {note.thumbnail && (
                    <div style={{ height: '120px', borderRadius: 'var(--border-radius-md)', overflow: 'hidden', marginBottom: '0.75rem' }}>
                      <img src={note.thumbnail} alt={note.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => { e.target.style.display = 'none'; }} />
                    </div>
                  )}
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-sm" style={{ flex: 1, marginRight: '8px', lineHeight: 1.4 }}>{note.title}</h3>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ color: '#ef4444', fontSize: '0.7rem', padding: '4px 8px', flexShrink: 0 }}
                      onClick={() => handleDelete(note._id || note.id)}
                      disabled={deletingId === (note._id || note.id)}
                    >
                      {deletingId === (note._id || note.id) ? '⏳' : '🗑️'}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted mb-2">
                    <span>{note.subject}</span>
                    <span>•</span>
                    <span>{note.educationLevel}</span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                    <span className="font-bold text-sm" style={{ color: '#10B981' }}>₹{note.price}</span>
                    <div className="flex items-center gap-3 text-xs text-muted">
                      <span>📥 {(note.downloads || 0).toLocaleString()}</span>
                      <span>⭐ {note.rating || 0}</span>
                    </div>
                  </div>
                  <Link to={`/note/${note._id || note.id}`} className="btn btn-outline btn-sm w-full mt-3" style={{ fontSize: '0.7rem' }}>
                    View Note →
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center py-12" style={{ border: '2px dashed var(--border-medium)', background: 'rgba(108,99,255,0.02)' }}>
              <span className="text-4xl mb-4 block animate-bounce-in">✏️</span>
              <h3 className="font-bold text-lg mb-2">Share your knowledge</h3>
              <p className="text-muted text-sm mb-6 max-w-md mx-auto">Upload your handwritten or digital notes. Our AI will digitalize them and suggest the perfect price!</p>
              <Link to="/upload" className="btn btn-primary animate-pulse-glow">Upload Your First Notes</Link>
            </div>
          )}
        </section>
      )}

      {/* My Purchased Notes */}
      {activeTab === 'purchased' && (
        <section className="animate-fade-in">
          {purchasedLoading ? (
            <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
              {[1, 2, 3].map(i => (
                <div key={i} className="card" style={{ height: '380px' }}>
                  <div className="skeleton" style={{ height: '180px' }}></div>
                  <div style={{ padding: '1.25rem' }}>
                    <div className="skeleton" style={{ height: '18px', width: '80%', marginBottom: '12px' }}></div>
                    <div className="skeleton" style={{ height: '14px', width: '50%', marginBottom: '8px' }}></div>
                    <div className="skeleton" style={{ height: '14px', width: '60%' }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : purchasedList.length > 0 ? (
            <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
              {purchasedList.map((note, i) => (
                <NoteCard key={note._id || note.id} note={note} index={i} />
              ))}
            </div>
          ) : (
            <div className="card text-center py-12">
              <span className="text-4xl mb-4 block">🛒</span>
              <h3 className="font-bold text-lg mb-2">No purchases yet</h3>
              <p className="text-muted text-sm mb-6">Start browsing notes to find study material you love!</p>
              <Link to="/browse" className="btn btn-outline">Browse Notes</Link>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default Dashboard;
