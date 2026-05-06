import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notesAPI } from '../context/api';
import SearchBar from '../components/ui/SearchBar';
import NoteCard from '../components/ui/NoteCard';

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const params = { limit: 6, sort: 'popular' };
        if (user?.educationLevel) {
          params.educationLevel = user.educationLevel;
        }
        const data = await notesAPI.getAll(params);
        let fetched = data.notes || [];
        // If user's level returns fewer than 6, backfill with popular notes
        if (fetched.length < 6 && user?.educationLevel) {
          const moreData = await notesAPI.getAll({ limit: 6, sort: 'popular' });
          const moreNotes = (moreData.notes || []).filter(
            n => !fetched.find(f => (f._id || f.id) === (n._id || n.id))
          );
          fetched = [...fetched, ...moreNotes].slice(0, 6);
        }
        setNotes(fetched);
      } catch (error) {
        console.error("Error fetching notes:", error);
        setNotes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, [user?.educationLevel]);

  const handleUploadClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      navigate('/login');
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="section" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', position: 'relative', marginTop: 'var(--space-12)', overflow: 'hidden' }}>
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(108,99,255,0.08), transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }}></div>
        <div style={{ position: 'absolute', bottom: '-15%', left: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(16,185,129,0.06), transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }}></div>
        <div style={{ position: 'absolute', top: '30%', left: '50%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(255,101,132,0.05), transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }}></div>

        <div className="container text-center animate-fade-in" style={{ maxWidth: '800px', position: 'relative', zIndex: 1 }}>
          <span className="section-eyebrow">📚 Your Knowledge Marketplace</span>
          <h1 className="section-title" style={{ fontSize: 'clamp(2.2rem, 4vw, 4rem)', marginBottom: 'var(--space-4)', lineHeight: 1.15 }}>
            Share & Discover <span className="text-gradient">Study Notes</span> from Every Standard
          </h1>
          <p className="text-muted text-lg mb-8" style={{ maxWidth: '600px', margin: '0 auto var(--space-8)', lineHeight: 1.7 }}>
            From Std 1 to Master's degree & government exam prep. Upload your notes, let AI digitalize them, and earn by helping others learn.
          </p>

          {/* Search Bar */}
          <div style={{ maxWidth: '680px', margin: '0 auto' }}>
            <SearchBar />
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-12 pt-8 hero-stats" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <div className="flex flex-col">
              <span className="font-black text-3xl text-gradient">50K+</span>
              <span className="text-sm text-muted font-medium mt-1">Notes Shared</span>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-3xl text-gradient-coral">25K+</span>
              <span className="text-sm text-muted font-medium mt-1">Active Students</span>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-3xl text-gradient-teal">200+</span>
              <span className="text-sm text-muted font-medium mt-1">Subjects</span>
            </div>
          </div>
        </div>
      </section>

      <div className="container divider"></div>

      {/* Notes Feed Section */}
      <section className="section container">
        <div className="section-header">
          <span className="section-eyebrow">📖 {user?.educationLevel ? 'Based on Your Level' : 'Popular Notes'}</span>
          <h2 className="section-title">
            {user?.educationLevel ? `Notes for ${user.educationLevel}` : 'Trending Notes'}
          </h2>
          <p className="section-subtitle">Handpicked study materials relevant to your education level.</p>
        </div>

        {loading ? (
          <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
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
        ) : (
          <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {notes.map((note, i) => (
              <NoteCard key={note._id || note.id} note={note} index={i} />
            ))}
          </div>
        )}

        <div className="flex justify-center mt-12">
          <Link to="/browse" className="btn btn-outline btn-lg">Browse All Notes →</Link>
        </div>
      </section>

      <div className="container divider"></div>

      {/* How It Works */}
      <section className="section container">
        <div className="section-header">
          <span className="section-eyebrow">How It Works</span>
          <h2 className="section-title">Three Steps to <span className="text-gradient">Knowledge</span></h2>
        </div>

        <div className="grid grid-3 gap-8">
          {[
            { icon: '📤', title: 'Upload Your Notes', desc: 'Upload your handwritten or digital notes. Our AI will analyze, digitalize, and suggest the perfect price.', color: 'rgba(108, 99, 255, 0.06)' },
            { icon: '🔍', title: 'Discover & Learn', desc: 'Search notes from Std 1 to Master\'s degree. Find exactly what you need for your exams and studies.', color: 'rgba(16, 185, 129, 0.06)' },
            { icon: '💬', title: 'Connect & Trade', desc: 'Chat with sellers to negotiate prices. Buy notes instantly or discuss customizations.', color: 'rgba(255, 101, 132, 0.06)' },
          ].map((step, i) => (
            <div key={i} className="card text-center animate-fade-in-up" style={{ padding: 'var(--space-8)', animationDelay: `${i * 0.15}s`, animationFillMode: 'both', background: step.color, border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>{step.icon}</div>
              <h3 className="font-bold text-lg mb-3">{step.title}</h3>
              <p className="text-muted text-sm" style={{ lineHeight: 1.7 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="container divider"></div>

      {/* Our Vision */}
      <section className="section container" id="vision">
        <div className="card relative overflow-hidden" style={{ padding: 'var(--space-16) var(--space-8)', background: 'linear-gradient(135deg, rgba(108,99,255,0.04), rgba(16,185,129,0.03))', border: '1px solid var(--border-medium)' }}>
          <div className="relative z-10">
            <div className="section-header" style={{ marginBottom: 'var(--space-8)' }}>
              <span className="section-eyebrow">🌟 Our Vision</span>
              <h2 className="section-title">Democratizing <span className="text-gradient">Education</span></h2>
            </div>
            
            <div className="grid grid-2 gap-8 vision-grid" style={{ maxWidth: '1000px', margin: '0 auto' }}>
              {[
                { icon: '🎯', title: 'Equal Access', desc: 'Every student deserves quality study material regardless of their location or financial background. EduMarket bridges this gap.' },
                { icon: '🤝', title: 'Peer Learning', desc: 'The best notes often come from students who just mastered the topic. We empower peer-to-peer knowledge sharing.' },
                { icon: '🤖', title: 'AI-Powered', desc: 'Our AI digitalizes handwritten notes, making them searchable and accessible. It also predicts fair pricing so everyone benefits.' },
                { icon: '💰', title: 'Earn While You Learn', desc: 'Turn your study hours into income. Upload your notes, help others learn, and earn money for your dedication.' },
              ].map((v, i) => (
                <div key={i} className="flex gap-4 items-start animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s`, animationFillMode: 'both' }}>
                  <div style={{ fontSize: '2rem', flexShrink: 0, background: 'rgba(108,99,255,0.08)', borderRadius: '12px', width: '52px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{v.icon}</div>
                  <div>
                    <h3 className="font-bold text-base mb-2">{v.title}</h3>
                    <p className="text-muted text-sm" style={{ lineHeight: 1.7 }}>{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section container text-center" style={{ marginBottom: 'var(--space-12)' }}>
        <div className="card relative overflow-hidden" style={{ padding: 'var(--space-16) var(--space-8)', background: 'linear-gradient(135deg, rgba(108,99,255,0.06), rgba(255,101,132,0.04))', border: '1px solid var(--border-medium)' }}>
          <div className="relative z-10">
            <h2 className="font-black text-4xl mb-6 text-gradient">Ready to share your knowledge?</h2>
            <p className="text-muted text-lg max-w-2xl mx-auto mb-8 font-medium">Upload your notes today and let our AI do the magic. Digitalize, price, and publish — all in minutes.</p>
            <div className="flex justify-center gap-4 cta-buttons">
              <Link to="/upload" className="btn btn-primary btn-xl animate-pulse-glow" onClick={handleUploadClick}>
                {isAuthenticated ? 'Upload Notes' : 'Sign in to Upload'}
              </Link>
              <Link to="/browse" className="btn btn-secondary btn-lg">Browse Notes</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
