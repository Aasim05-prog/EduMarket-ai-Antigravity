import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { EDUCATION_LEVELS } from '../data/mockData';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    educationLevel: '',
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

  // Get the redirect path (where user came from)
  const from = location.state?.from || '/';

  // Redirect if already logged in
  if (isAuthenticated) {
    navigate(from, { replace: true });
    return null;
  }

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      if (!formData.email || !formData.password) {
        setError('Please fill in all fields');
        return;
      }
      setSubmitting(true);
      const result = await login({ email: formData.email, password: formData.password });
      setSubmitting(false);
      if (result.success) {
        navigate(from);
      } else {
        setError(result.error || 'Login failed');
      }
    } else {
      if (!formData.fullName || !formData.username || !formData.email || !formData.password || !formData.educationLevel) {
        setError('Please fill in all fields');
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      setSubmitting(true);
      const result = await register(formData);
      setSubmitting(false);
      if (result.success) {
        navigate(from);
      } else {
        setError(result.error || 'Registration failed');
      }
    }
  };

  const [forgotDevToken, setForgotDevToken] = useState('');

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotLoading(true);
    setForgotMsg('');
    setForgotDevToken('');
    try {
      const resp = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await resp.json();
      setForgotMsg(data.message || 'Check your email for the reset link.');
      // Dev mode: backend returned a token directly (email not configured)
      if (data.resetToken) {
        setForgotDevToken(data.resetToken);
      }
    } catch {
      setForgotMsg('Something went wrong. Please try again.');
    }
    setForgotLoading(false);
  };

  return (
    <section className="section flex items-center justify-center min-h-screen relative" style={{ paddingTop: '6vh' }}>
      
      {/* Decorative elements */}
      <div style={{ position: 'absolute', top: '10%', left: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(108,99,255,0.08), transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(16,185,129,0.06), transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }}></div>
      
      <div className="container flex justify-center z-10 w-full animate-bounce-in">
        <div className="card" style={{ width: '100%', maxWidth: '460px', padding: 'var(--space-8)' }}>
          
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-6">
              <span className="font-black text-2xl text-gradient">EduMarket</span>
            </Link>
            <h2 className="font-extrabold text-3xl mb-2">{isLogin ? 'Welcome Back' : 'Join EduMarket'}</h2>
            <p className="text-muted text-sm">{isLogin ? 'Sign in to access your study notes' : 'Create your account and start sharing knowledge'}</p>
          </div>

          {error && (
            <div className="mb-6 animate-slide-down" style={{
              padding: '0.75rem 1rem',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: 'var(--border-radius-md)',
              color: '#dc2626',
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
            }}>
              ⚠️ {error}
            </div>
          )}

          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div className="input-group">
                  <label className="input-label">Full Name</label>
                  <div className="input-with-icon">
                    <span className="input-icon">👤</span>
                    <input 
                      type="text" name="fullName" className="input"
                      placeholder="John Doe"
                      value={formData.fullName} onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Username</label>
                  <div className="input-with-icon">
                    <span className="input-icon">@</span>
                    <input 
                      type="text" name="username" className="input"
                      placeholder="john_doe"
                      value={formData.username} onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Education Standard</label>
                  <select 
                    name="educationLevel" className="input"
                    value={formData.educationLevel} onChange={handleChange}
                    style={{ cursor: 'pointer', appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' fill=\'%2394a3b8\' viewBox=\'0 0 16 16\'%3E%3Cpath d=\'M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center' }}
                  >
                    <option value="">Select your education level</option>
                    {EDUCATION_LEVELS.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
            
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <div className="input-with-icon">
                <span className="input-icon">✉️</span>
                <input 
                  type="email" name="email" className="input"
                  placeholder="you@example.com"
                  value={formData.email} onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="input-group">
              <label className="input-label flex justify-between items-center w-full">
                <span>Password</span>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => setForgotOpen(true)}
                    className="text-primary text-xs font-semibold hover:underline"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, transition: 'color var(--transition-fast)' }}
                  >Forgot?</button>
                )}
              </label>
              <div className="input-with-icon" style={{ position: 'relative' }}>
                <span className="input-icon">🔒</span>
                <input 
                  type={showPassword ? 'text' : 'password'} name="password" className="input"
                  placeholder="••••••••"
                  value={formData.password} onChange={handleChange}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ 
                    position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                    fontSize: '0.85rem', padding: '4px',
                  }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg mt-2 w-full animate-pulse-glow" style={{ fontSize: '1rem' }} disabled={submitting}>
              {submitting ? '⏳ Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="divider-text" style={{ margin: 'var(--space-6) 0' }}>
            <span>or continue with</span>
          </div>

          <div className="flex gap-4">
            <button type="button" className="btn btn-secondary w-full flex justify-center items-center gap-2">
              <span className="font-bold text-lg" style={{ color: '#ea4335' }}>G</span> Google
            </button>
            <button type="button" className="btn btn-secondary w-full flex justify-center items-center gap-2">
               GitHub
            </button>
          </div>

          <p className="text-center text-sm text-muted mt-8">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(''); }} 
              className="text-primary font-bold hover:underline"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 animate-fade-in"
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', padding: '1rem' }}
          onClick={e => { if (e.target === e.currentTarget) { setForgotOpen(false); setForgotMsg(''); } }}
        >
          <div className="card animate-bounce-in" style={{ width: '100%', maxWidth: '420px', padding: 'var(--space-8)', position: 'relative' }}>
            <button onClick={() => { setForgotOpen(false); setForgotMsg(''); }}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--text-muted)' }}
            >✕</button>
            <h2 className="font-extrabold text-xl mb-1">🔑 Reset Password</h2>
            <p className="text-muted text-sm mb-6">Enter your email and we'll send a reset link.</p>

            {forgotMsg ? (
              <div className="flex flex-col gap-3">
                <div style={{ padding: '1rem', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--border-radius-md)', color: '#059669', fontSize: '0.875rem' }}>
                  ✅ {forgotMsg}
                </div>
                {forgotDevToken && (
                  <div style={{ padding: '1rem', background: 'rgba(108,99,255,0.06)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: 'var(--border-radius-md)', fontSize: '0.8rem' }}>
                    <p className="font-semibold mb-2" style={{ color: 'var(--brand-primary)' }}>🛠️ Dev Mode — Email not configured</p>
                    <p className="text-muted mb-3">Click the link below to reset your password:</p>
                    <a
                      href={`/reset-password?token=${forgotDevToken}`}
                      className="btn btn-primary w-full"
                      style={{ textDecoration: 'none', display: 'block', textAlign: 'center' }}
                      onClick={() => setForgotOpen(false)}
                    >🔑 Reset Password Now</a>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
                <div className="input-group">
                  <label className="input-label">Email Address</label>
                  <div className="input-with-icon">
                    <span className="input-icon">✉️</span>
                    <input type="email" className="input" placeholder="you@example.com"
                      value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={forgotLoading}>
                  {forgotLoading ? '⏳ Sending...' : '📧 Send Reset Link'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default Auth;
