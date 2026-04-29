import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { getSocket } from './context/socket';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

import Home from './pages/Home';
import Auth from './pages/Auth';
import BrowseNotes from './pages/BrowseNotes';
import NoteDetail from './pages/NoteDetail';
import Dashboard from './pages/Dashboard';
import UserProfile from './pages/UserProfile';
import ChatPage from './pages/ChatPage';
import UploadNotes from './pages/UploadNotes';
import ResetPassword from './pages/ResetPassword';

// Dynamic page title + scroll to top
const PageManager = () => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const titles = {
      '/': 'EduMarket — Share & Discover Study Notes',
      '/login': 'Sign In — EduMarket',
      '/browse': 'Browse Notes — EduMarket',
      '/dashboard': 'Dashboard — EduMarket',
      '/upload': 'Upload Notes — EduMarket',
      '/chat': 'Messages — EduMarket',
      '/reset-password': 'Reset Password — EduMarket',
    };
    const path = location.pathname;
    document.title = titles[path] 
      || (path.startsWith('/note/') ? 'Note Details — EduMarket'
        : path.startsWith('/profile/') ? 'User Profile — EduMarket'
        : path.startsWith('/chat/') ? 'Chat — EduMarket'
        : 'EduMarket — Learn Without Limits');
  }, [location.pathname]);
  return null;
};

const NotFound = () => (
  <div className="container min-h-screen flex flex-col items-center justify-center text-center" style={{ paddingTop: '15vh' }}>
    <div className="animate-bounce-in" style={{ marginBottom: 'var(--space-8)' }}>
      <div style={{ 
        fontSize: '8rem', fontWeight: 900, lineHeight: 1, 
        background: 'var(--gradient-purple)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        filter: 'drop-shadow(0 4px 12px rgba(108, 99, 255, 0.3))',
      }}>404</div>
    </div>
    <h2 className="font-bold text-2xl mb-3" style={{ color: 'var(--text-primary)' }}>Page Not Found</h2>
    <p className="text-muted mb-8 max-w-md" style={{ lineHeight: 1.7 }}>
      The page you're looking for doesn't exist or has been moved. Let's get you back on track!
    </p>
    <div className="flex gap-4">
      <Link to="/" className="btn btn-primary btn-lg">🏠 Go Home</Link>
      <Link to="/browse" className="btn btn-secondary btn-lg">📚 Browse Notes</Link>
    </div>
  </div>
);

function App() {
  const [socket, setSocket] = useState(null);

  return (
    <AuthProvider onLogin={() => setSocket(getSocket())}>
      <Router>
        <PageManager />
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar socket={getSocket()} />
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Auth />} />
              <Route path="/browse" element={<BrowseNotes />} />
              <Route path="/note/:id" element={<NoteDetail />} />
              <Route path="/profile/:username" element={<UserProfile />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
              <Route path="/chat/:userId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
              <Route path="/upload" element={<ProtectedRoute><UploadNotes /></ProtectedRoute>} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
