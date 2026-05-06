import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { usersAPI, notesAPI } from '../context/api';
import { getInitials, getAvatarColor, EDUCATION_LEVELS } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import NoteCard from '../components/ui/NoteCard';

// ─── Edit Profile Modal ─────────────────────────────────────────────────────
const EditProfileModal = ({ user, onClose, onSave }) => {
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    bio: user?.bio || '',
    educationLevel: user?.educationLevel || '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const avatarInputRef = useRef(null);

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Avatar must be an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Avatar must be smaller than 5MB'); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.fullName.trim()) { setError('Full name is required'); return; }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('fullName', form.fullName.trim());
      formData.append('bio', form.bio.trim());
      formData.append('educationLevel', form.educationLevel);
      if (avatarFile) formData.append('avatar', avatarFile);
      const updated = await usersAPI.updateProfile(formData);
      onSave(updated);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    }
    setSaving(false);
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 animate-fade-in"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', padding: '1rem' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="card animate-bounce-in" style={{ width: '100%', maxWidth: '480px', padding: 'var(--space-8)', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--text-muted)', lineHeight: 1 }}
        >✕</button>

        <div className="mb-6">
          <h2 className="font-extrabold text-2xl mb-1">Edit Profile</h2>
          <p className="text-muted text-sm">Update your public profile information</p>
        </div>

        {error && (
          <div className="mb-4 animate-slide-down" style={{
            padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--border-radius-md)',
            color: '#dc2626', fontSize: 'var(--text-sm)', fontWeight: 500,
          }}>⚠️ {error}</div>
        )}

        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          {/* Avatar Upload */}
          <div className="input-group">
            <label className="input-label">Profile Picture</label>
            <div className="flex items-center gap-4">
              <div
                onClick={() => avatarInputRef.current?.click()}
                style={{
                  width: '72px', height: '72px', borderRadius: '50%', cursor: 'pointer',
                  border: '3px dashed var(--border-medium)', overflow: 'hidden',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: avatarPreview ? 'transparent' : 'var(--bg-elevated)',
                  transition: 'border-color var(--transition-fast)',
                  flexShrink: 0,
                }}
                title="Click to change avatar"
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '1.5rem' }}>📷</span>
                )}
              </div>
              <div>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => avatarInputRef.current?.click()}
                >
                  {avatarPreview ? '🔄 Change Photo' : '📷 Upload Photo'}
                </button>
                <p className="text-xs text-muted mt-1">JPG, PNG up to 5MB</p>
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleAvatarChange}
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Full Name</label>
            <div className="input-with-icon">
              <span className="input-icon">👤</span>
              <input
                type="text" name="fullName" className="input"
                placeholder="Your full name"
                value={form.fullName} onChange={handleChange}
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Education Level</label>
            <select
              name="educationLevel" className="input"
              value={form.educationLevel} onChange={handleChange}
              style={{ cursor: 'pointer' }}
            >
              <option value="">Select education level</option>
              {EDUCATION_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Bio</label>
            <textarea
              name="bio" className="input" rows={4}
              placeholder="Tell the community about yourself, your expertise, and what kind of notes you create..."
              value={form.bio} onChange={handleChange}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="flex gap-3 mt-2">
            <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1 }}>
              {saving ? '⏳ Saving...' : '✅ Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── User Profile Page ───────────────────────────────────────────────────────
const UserProfile = () => {
  const { username } = useParams();
  const { user: currentUser, isAuthenticated, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState(null);
  const [userNotes, setUserNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);

      if (isOwnProfile && currentUser) {
        setProfileUser(currentUser);
        try {
          const sellerId = currentUser._id || currentUser.id;
          const notes = await notesAPI.getBySeller(sellerId);
          setUserNotes(notes || []);
        } catch {
          setUserNotes([]);
        }
        setLoading(false);
        return;
      }

      try {
        const userData = await usersAPI.getByUsername(username);
        setProfileUser(userData);
        if (userData._id) {
          const notes = await notesAPI.getBySeller(userData._id);
          setUserNotes(notes || []);
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setProfileUser(null);
        setUserNotes([]);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [username, isOwnProfile, currentUser]);

  const handleSave = (updatedUser) => {
    // Update local profile display
    setProfileUser(prev => ({ ...prev, ...updatedUser }));
    // Sync to AuthContext so Navbar + other pages reflect the change
    updateProfile(updatedUser);
  };

  if (loading) {
    return (
      <div className="container min-h-screen" style={{ paddingTop: '10vh', paddingBottom: 'var(--space-20)' }}>
        <div className="card animate-fade-in" style={{ padding: 'var(--space-8)' }}>
          <div className="flex flex-wrap items-center gap-8">
            <div className="skeleton" style={{ width: '100px', height: '100px', borderRadius: '50%' }}></div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div className="skeleton" style={{ height: '28px', width: '200px', marginBottom: '8px' }}></div>
              <div className="skeleton" style={{ height: '16px', width: '120px', marginBottom: '8px' }}></div>
              <div className="skeleton" style={{ height: '14px', width: '300px' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="container min-h-screen flex items-center justify-center">
        <div className="card text-center" style={{ padding: 'var(--space-12)' }}>
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="font-bold text-2xl mb-2">User Not Found</h2>
          <p className="text-muted mb-6">@{username} doesn't exist on EduMarket.</p>
          <Link to="/" className="btn btn-primary">Go Home</Link>
        </div>
      </div>
    );
  }

  const displayName = profileUser.fullName || profileUser.fullname || 'User';
  const displayUsername = profileUser.username || '';
  const userId = profileUser._id || profileUser.id;

  const handleMessage = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    navigate(`/chat/${userId}`);
  };

  return (
    <div className="container min-h-screen" style={{ paddingTop: '10vh', paddingBottom: 'var(--space-20)' }}>
      {/* Edit Profile Modal */}
      {editOpen && (
        <EditProfileModal
          user={profileUser}
          onClose={() => setEditOpen(false)}
          onSave={handleSave}
        />
      )}

      {/* Profile Header */}
      <div className="card animate-fade-in" style={{ padding: 'var(--space-8)', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: getAvatarColor(displayUsername), opacity: 0.05,
          filter: 'blur(80px)', pointerEvents: 'none',
        }}></div>

        <div className="relative z-10 flex flex-wrap items-center gap-8 profile-header-content">
          <div className="avatar avatar-xl profile-avatar" style={{
            background: getAvatarColor(displayUsername),
            fontSize: '2rem', width: '100px', height: '100px',
            boxShadow: '0 8px 24px rgba(108, 99, 255, 0.2)',
          }}>
            {getInitials(displayName)}
          </div>

          <div className="flex-1" style={{ minWidth: '200px' }}>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-extrabold text-3xl" style={{ color: 'var(--text-primary)' }}>{displayName}</h1>
            </div>
            <p className="text-muted text-sm mt-1">@{displayUsername}</p>
            <span className="badge badge-primary mt-2" style={{ display: 'inline-flex', fontSize: '0.7rem' }}>
              {profileUser.educationLevel}
            </span>
            {profileUser.bio && (
              <p className="text-muted text-sm mt-3" style={{ maxWidth: '500px', lineHeight: 1.7 }}>{profileUser.bio}</p>
            )}
            {!profileUser.bio && isOwnProfile && (
              <p className="text-muted text-sm mt-3 italic" style={{ opacity: 0.6 }}>
                No bio yet — <button onClick={() => setEditOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand-primary)', fontWeight: 600 }}>add one now</button>
              </p>
            )}
            <p className="text-xs text-muted mt-2">
              📅 Joined {new Date(profileUser.joinedDate || profileUser.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
            </p>
          </div>

          <div className="flex gap-3 flex-wrap profile-header-actions">
            {!isOwnProfile && (
              <button onClick={handleMessage} className="btn btn-primary">
                💬 {isAuthenticated ? 'Send Message' : 'Sign in to Message'}
              </button>
            )}
            {isOwnProfile && (
              <>
                <button onClick={() => setEditOpen(true)} className="btn btn-primary">
                  ✏️ Edit Profile
                </button>
                <Link to="/dashboard" className="btn btn-secondary">⚙️ Dashboard</Link>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-8 mt-8 pt-6 relative z-10 profile-stats" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          {[
            { value: profileUser.notesUploaded || userNotes.length, label: 'Notes Uploaded', gradient: 'text-gradient' },
            { value: (profileUser.totalDownloads || 0).toLocaleString(), label: 'Total Downloads', gradient: 'text-gradient-teal' },
            { value: profileUser.rating > 0 ? `${profileUser.rating} ★` : 'New', label: 'Avg Rating', gradient: 'text-gradient-gold' },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className={`font-black text-2xl ${stat.gradient}`}>{stat.value}</span>
              <span className="text-xs text-muted mt-1">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* User's Notes */}
      <section style={{ marginTop: 'var(--space-12)' }}>
        <h2 className="font-bold text-2xl mb-8" style={{ color: 'var(--text-primary)' }}>
          {isOwnProfile ? '📤 My Uploaded Notes' : `📚 Notes by ${displayName}`}
        </h2>

        {userNotes.length > 0 ? (
          <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {userNotes.map((note, i) => (
              <NoteCard key={note._id || note.id} note={note} index={i} />
            ))}
          </div>
        ) : (
          <div className="card text-center" style={{ padding: 'var(--space-12)', border: '2px dashed var(--border-medium)' }}>
            <div className="text-5xl mb-4">📝</div>
            <h3 className="font-bold text-xl mb-2" style={{ color: 'var(--text-primary)' }}>No notes uploaded yet</h3>
            <p className="text-muted mb-6">
              {isOwnProfile
                ? 'Start sharing your knowledge with the community!'
                : `${displayName} hasn't uploaded any notes yet.`}
            </p>
            {isOwnProfile && (
              <Link to="/upload" className="btn btn-primary">Upload Your First Notes</Link>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default UserProfile;
