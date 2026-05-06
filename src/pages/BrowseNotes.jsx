import { useState, useEffect } from 'react';
import NoteCard from '../components/ui/NoteCard';
import { notesAPI } from '../context/api';
import { EDUCATION_LEVELS, SUBJECTS } from '../data/mockData';

const BrowseNotes = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [sortBy, setSortBy] = useState('popular');
  const [showTextbooks, setShowTextbooks] = useState(false);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);

  // Group education levels for cleaner sidebar
  const levelGroups = [
    { label: 'Primary (1-5)', levels: ['Std 1', 'Std 2', 'Std 3', 'Std 4', 'Std 5'] },
    { label: 'Middle (6-8)', levels: ['Std 6', 'Std 7', 'Std 8'] },
    { label: 'Secondary (9-10)', levels: ['Std 9', 'Std 10'] },
    { label: 'Senior Secondary', levels: ['Std 11 - Science', 'Std 11 - Commerce', 'Std 11 - Arts', 'Std 12 - Science', 'Std 12 - Commerce', 'Std 12 - Arts'] },
    { label: 'Higher Education', levels: ["Bachelor's Degree", "Master's Degree", 'PhD'] },
    { label: 'Government Exams', levels: ['Government Exam - UPSC', 'Government Exam - SSC', 'Government Exam - Banking', 'Government Exam - Railway', 'Government Exam - Other'] },
  ];

  // Fetch notes from API
  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = { sort: sortBy, page, limit: 20 };
        if (searchQuery) params.search = searchQuery;
        if (selectedLevel !== 'All') params.educationLevel = selectedLevel;
        if (selectedSubject !== 'All') params.subject = selectedSubject;
        if (showTextbooks) params.isTextbook = 'true';

        const data = await notesAPI.getAll(params);
        setNotes(data.notes || []);
        setTotal(data.total || 0);
        setTotalPages(data.pages || 1);
      } catch (err) {
        console.error("Error fetching notes:", err);
        setError("Failed to load notes. Please try again.");
        setNotes([]);
        setTotal(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchNotes, searchQuery ? 400 : 0);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedLevel, selectedSubject, sortBy, page, showTextbooks]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedLevel, selectedSubject, sortBy, showTextbooks]);

  return (
    <div className="container min-h-screen" style={{ paddingTop: '10vh', paddingBottom: 'var(--space-20)' }}>
      <div className="text-center my-12 animate-fade-in-up">
        <h1 className="section-title text-5xl mb-4">Browse <span className="text-gradient">Notes & Books</span></h1>
        <p className="text-muted text-lg max-w-2xl mx-auto">Find study materials from Std 1 to Master's degree and government exam preparation.</p>
        <div className="flex justify-center gap-3 mt-6">
          <button onClick={() => { setShowTextbooks(false); setSelectedLevel('All'); setSelectedSubject('All'); }}
            className={`btn btn-sm ${!showTextbooks ? 'btn-primary' : 'btn-secondary'}`}
          >📝 All Notes</button>
          <button onClick={() => { setShowTextbooks(true); setSelectedLevel('All'); setSelectedSubject('All'); }}
            className={`btn btn-sm ${showTextbooks ? 'btn-primary' : 'btn-secondary'}`}
            style={showTextbooks ? { background: 'var(--gradient-teal)' } : {}}
          >📖 Free Textbooks</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-8 browse-layout" style={{ alignItems: 'flex-start' }}>
        
        {/* Sidebar Filters */}
        <aside className="card flex-shrink-0 animate-fade-in browse-sidebar" style={{ width: '100%', maxWidth: '280px', padding: 'var(--space-6)', position: 'sticky', top: '100px' }}>
          <h3 className="font-bold text-xl mb-6">Filters</h3>
          
          {/* Search */}
          <div className="mb-8">
            <h4 className="font-semibold text-sm text-muted mb-3 uppercase tracking-wider">Search</h4>
            <input 
              type="text" className="input w-full" placeholder="Search notes..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Education Level */}
          <div className="mb-8">
            <h4 className="font-semibold text-sm text-muted mb-3 uppercase tracking-wider">Education Level</h4>
            <div className="flex flex-col gap-2" style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="radio" name="level" checked={selectedLevel === 'All'} onChange={() => setSelectedLevel('All')}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--brand-primary)', cursor: 'pointer' }} />
                <span className={`text-sm transition-colors ${selectedLevel === 'All' ? 'font-bold' : 'text-muted'}`} style={{ color: selectedLevel === 'All' ? 'var(--brand-primary)' : undefined }}>All Levels</span>
              </label>
              {levelGroups.map(group => (
                <div key={group.label} className="mt-2">
                  <span className="text-xs font-bold text-muted uppercase tracking-wider" style={{ opacity: 0.6 }}>{group.label}</span>
                  {group.levels.map(level => (
                    <label key={level} className="flex items-center gap-3 cursor-pointer group mt-1" style={{ paddingLeft: '8px' }}>
                      <input type="radio" name="level" checked={selectedLevel === level} onChange={() => setSelectedLevel(level)}
                        style={{ width: '14px', height: '14px', accentColor: 'var(--brand-primary)', cursor: 'pointer' }} />
                      <span className={`text-xs transition-colors ${selectedLevel === level ? 'font-bold' : 'text-muted'}`} style={{ color: selectedLevel === level ? 'var(--brand-primary)' : undefined }}>
                        {level.replace('Government Exam - ', '')}
                      </span>
                    </label>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div className="mb-8">
            <h4 className="font-semibold text-sm text-muted mb-3 uppercase tracking-wider">Subject</h4>
            <select className="input w-full" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}
              style={{ cursor: 'pointer', fontSize: '0.875rem' }}>
              <option value="All">All Subjects</option>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Clear */}
          <button className="btn btn-outline btn-sm w-full" onClick={() => { setSearchQuery(''); setSelectedLevel('All'); setSelectedSubject('All'); }}>
            Clear All Filters
          </button>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, minWidth: '300px' }}>
          <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
            <span className="text-sm font-medium text-muted">
              {loading ? 'Loading...' : `Showing ${notes.length}${total > notes.length ? ` of ${total}` : ''} results`}
              {error && <span className="text-xs ml-2" style={{ color: 'var(--brand-warning)' }}>({error})</span>}
            </span>
            <select className="input" value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest First</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
          </div>

          {loading ? (
            <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
              {[1, 2, 3, 4, 5, 6].map(i => (
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
          ) : notes.length > 0 ? (
            <>
              <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                {notes.map((note, i) => (
                  <NoteCard key={note._id || note.id} note={note} index={i} />
                ))}
              </div>
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-12">
                  <button className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                    ← Previous
                  </button>
                  <span className="text-sm font-medium text-muted">Page {page} of {totalPages}</span>
                  <button className="btn btn-secondary btn-sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                    Next →
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="card text-center py-16 animate-fade-in-up">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="font-bold text-xl mb-2">No notes found</h3>
              <p className="text-muted">Try adjusting your filters or search query.</p>
              <button className="btn btn-outline mt-6" onClick={() => { setSearchQuery(''); setSelectedLevel('All'); setSelectedSubject('All'); }}>
                Clear All Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default BrowseNotes;
