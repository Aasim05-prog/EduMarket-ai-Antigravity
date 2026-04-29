import { Link, useNavigate } from 'react-router-dom';
import { getInitials, getAvatarColor } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';

const NoteCard = ({ note, index = 0 }) => {
  const { isNotePurchased, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Support both API shape (_id + populated sellerId object) and mock shape (id + sellerId string)
  const noteId = note._id || note.id;
  const seller = typeof note.sellerId === 'object' && note.sellerId !== null
    ? note.sellerId
    : note.seller || null;
  const sellerUsername = seller?.username || '';
  const sellerFullName = seller?.fullName || 'Unknown';
  const sellerIsOnline = seller?.isOnline ?? false;
  const sellerId = seller?._id || seller?.id || note.sellerId;

  const isPurchased = isNotePurchased(noteId);

  const handleChatClick = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate(`/chat/${sellerId}`);
  };

  const handleUnlockClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      navigate('/login');
    }
  };

  return (
    <div 
      className="note-card card animate-fade-in-up" 
      style={{ height: '100%', animationDelay: `${index * 0.08}s`, animationFillMode: 'both' }}
    >
      {/* Thumbnail with lock overlay */}
      <div className="note-card-thumb" style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
        <img
          src={note.thumbnail}
          alt={note.title}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transition: 'transform var(--transition-slow)',
            filter: isPurchased ? 'none' : 'blur(2px) brightness(0.85)',
          }}
          className="hover-zoom"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80'; }}
        />
        
        {/* Lock overlay */}
        {!isPurchased && (
          <div className="note-lock-overlay">
            <div className="note-lock-icon">🔒</div>
          </div>
        )}

        {/* Badges */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10, display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <span className="badge badge-primary" style={{ backdropFilter: 'blur(8px)', background: 'rgba(108, 99, 255, 0.85)', color: '#fff', fontSize: '0.65rem' }}>
            {note.educationLevel}
          </span>
          {note.isHandwritten && (
            <span className="badge badge-warning" style={{ backdropFilter: 'blur(8px)', background: 'rgba(245, 158, 11, 0.85)', color: '#fff', fontSize: '0.65rem' }}>
              ✍️ Handwritten
            </span>
          )}
        </div>

        {/* Price tag */}
        <div className="note-price-tag">
          ₹{note.price}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 className="font-semibold" style={{ 
          fontSize: '0.95rem', marginBottom: '0.35rem', lineHeight: 1.4,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' 
        }}>
          {note.title}
        </h3>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-muted">{note.subject}</span>
          <span className="text-xs text-muted">•</span>
          <span className="text-xs text-muted">{note.pages} pages</span>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="stars flex items-center">
            {[1, 2, 3, 4, 5].map(i => (
              <span key={i} className={i <= Math.round(note.rating) ? 'star' : 'star-empty'} style={{ fontSize: '0.75rem' }}>★</span>
            ))}
          </div>
          <span className="text-xs font-medium" style={{ color: '#F59E0B' }}>{note.rating}</span>
          <span className="text-xs text-muted">({(note.downloads || 0).toLocaleString()} downloads)</span>
        </div>

        {/* Seller info */}
        {seller && (
          <Link 
            to={`/profile/${sellerUsername}`}
            className="note-seller-bar"
          >
            <div className="avatar" style={{ 
              width: '28px', height: '28px', fontSize: '0.65rem',
              background: getAvatarColor(sellerUsername), flexShrink: 0
            }}>
              {getInitials(sellerFullName)}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{sellerFullName}</span>
              <span className="text-xs text-muted">@{sellerUsername}</span>
            </div>
            {sellerIsOnline && (
              <div className="online-dot" style={{ marginLeft: 'auto' }}></div>
            )}
          </Link>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-auto" style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
          <Link 
            to={`/note/${noteId}`} 
            className="btn btn-primary btn-sm" 
            style={{ flex: 1, fontSize: '0.75rem' }}
            onClick={handleUnlockClick}
          >
            {isPurchased ? '📖 Read' : '🔓 Unlock'}
          </Link>
          {seller && (
            <button
              onClick={handleChatClick}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem' }}
            >
              💬
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
