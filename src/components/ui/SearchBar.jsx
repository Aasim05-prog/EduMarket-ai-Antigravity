import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notesAPI, usersAPI } from '../../context/api';
import { getInitials, getAvatarColor } from '../../data/mockData';

const SearchBar = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('notes'); // 'notes' | 'users'
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setError(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      setError(false);
      try {
        if (activeTab === 'notes') {
          const data = await notesAPI.getAll({ search: query, limit: 6 });
          setResults(data.notes || []);
        } else {
          const data = await usersAPI.search(query);
          setResults(data || []);
        }
      } catch {
        setResults([]);
        setError(true);
      }
      setSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, activeTab]);

  const handleNoteClick = (note) => {
    const noteId = note._id || note.id;
    navigate(`/note/${noteId}`);
    if (onClose) onClose();
  };

  const handleUserClick = (user) => {
    navigate(`/profile/${user.username}`);
    if (onClose) onClose();
  };

  return (
    <div className="search-bar-wrapper">
      {/* Search Input */}
      <div className="search-input-container">
        <span className="search-icon">🔍</span>
        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder={activeTab === 'notes' ? 'Search notes, books, subjects, standards...' : 'Search users by username...'}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button className="search-clear" onClick={() => setQuery('')}>✕</button>
        )}
      </div>

      {/* Tabs */}
      <div className="search-tabs">
        <button
          className={`search-tab ${activeTab === 'notes' ? 'active' : ''}`}
          onClick={() => { setActiveTab('notes'); setResults([]); }}
        >
          📚 Notes & Books
        </button>
        <button
          className={`search-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => { setActiveTab('users'); setResults([]); }}
        >
          👤 Users
        </button>
      </div>

      {/* Results */}
      {query.trim() && (
        <div className="search-results">
          {searching ? (
            <div className="search-empty">
              <div className="animate-spin" style={{ width: '24px', height: '24px', border: '3px solid var(--border-medium)', borderTopColor: 'var(--brand-primary)', borderRadius: '50%' }}></div>
              <p className="text-muted text-sm">Searching...</p>
            </div>
          ) : error ? (
            <div className="search-empty">
              <span style={{ fontSize: '2rem' }}>⚠️</span>
              <p className="text-muted text-sm">Search unavailable — backend may be offline.</p>
            </div>
          ) : results.length === 0 ? (
            <div className="search-empty">
              <span style={{ fontSize: '2rem' }}>🔍</span>
              <p className="text-muted text-sm">No {activeTab} found for "{query}"</p>
            </div>
          ) : (
            results.map(item => (
              activeTab === 'notes' ? (
                <button
                  key={item._id || item.id}
                  className="search-result-item"
                  onClick={() => handleNoteClick(item)}
                >
                  <div className="search-result-thumb" style={{
                    backgroundImage: `url(${item.thumbnail})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}></div>
                  <div className="search-result-info">
                    <span className="search-result-title">{item.title}</span>
                    <div className="flex items-center gap-2">
                      <span className="badge badge-primary" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>{item.educationLevel}</span>
                      <span className="text-muted text-xs">{item.subject}</span>
                      <span className="text-xs font-bold" style={{ color: '#43D9AD' }}>₹{item.price}</span>
                    </div>
                  </div>
                </button>
              ) : (
                <button
                  key={item._id || item.id}
                  className="search-result-item"
                  onClick={() => handleUserClick(item)}
                >
                  <div className="avatar avatar-sm" style={{ background: getAvatarColor(item.username), flexShrink: 0 }}>
                    {getInitials(item.fullName)}
                  </div>
                  <div className="search-result-info">
                    <span className="search-result-title">{item.fullName}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted text-xs">@{item.username}</span>
                      <span className="text-xs" style={{ color: 'var(--brand-primary)' }}>{item.educationLevel}</span>
                    </div>
                  </div>
                </button>
              )
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
