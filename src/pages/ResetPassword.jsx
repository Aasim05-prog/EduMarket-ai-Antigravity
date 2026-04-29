import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing reset token. Please request a new password reset link.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters');
      return;
    }
    if (password !== confirm) {
      setMessage('Passwords do not match');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus('error');
        setMessage(data.message || 'Reset failed. Please try again.');
      } else {
        setStatus('success');
        setMessage(data.message);
        setTimeout(() => navigate('/login'), 3000);
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please check your connection and try again.');
    }
  };

  return (
    <section className="section flex items-center justify-center min-h-screen relative" style={{ paddingTop: '6vh' }}>
      {/* Decorative blobs */}
      <div style={{ position: 'absolute', top: '10%', left: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(108,99,255,0.08), transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(16,185,129,0.06), transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div className="card animate-bounce-in" style={{ width: '100%', maxWidth: '460px', padding: 'var(--space-10)' }}>
        {/* Logo */}
        <div className="text-center mb-8">
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🔑</div>
          <h1 className="font-extrabold text-2xl">
            Set New <span className="text-gradient">Password</span>
          </h1>
          <p className="text-muted text-sm mt-2">Enter your new password below</p>
        </div>

        {status === 'success' ? (
          <div className="flex flex-col items-center gap-4 text-center animate-fade-in">
            <div style={{ fontSize: '3.5rem' }}>✅</div>
            <h2 className="font-bold text-xl">Password Reset!</h2>
            <p className="text-muted text-sm">{message}</p>
            <p className="text-muted text-xs">Redirecting to login in 3 seconds...</p>
            <Link to="/login" className="btn btn-primary w-full mt-2">Sign In Now →</Link>
          </div>
        ) : status === 'error' && !password ? (
          <div className="flex flex-col items-center gap-4 text-center animate-fade-in">
            <div style={{ fontSize: '3rem' }}>❌</div>
            <p className="font-semibold" style={{ color: '#dc2626' }}>{message}</p>
            <Link to="/login" className="btn btn-primary">Request New Reset Link</Link>
          </div>
        ) : (
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            {message && (
              <div style={{
                padding: '0.75rem 1rem',
                background: status === 'error' ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)',
                border: `1px solid ${status === 'error' ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`,
                borderRadius: 'var(--border-radius-md)',
                color: status === 'error' ? '#dc2626' : '#059669',
                fontSize: 'var(--text-sm)',
              }}>
                {status === 'error' ? '⚠️' : '✅'} {message}
              </div>
            )}

            <div className="input-group">
              <label className="input-label">New Password</label>
              <div className="input-with-icon" style={{ position: 'relative' }}>
                <span className="input-icon">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setMessage(''); }}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Confirm Password</label>
              <div className="input-with-icon">
                <span className="input-icon">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input"
                  placeholder="••••••••"
                  value={confirm}
                  onChange={e => { setConfirm(e.target.value); setMessage(''); }}
                  required
                />
              </div>
              {confirm && password !== confirm && (
                <p className="text-xs mt-1" style={{ color: '#dc2626' }}>Passwords don't match</p>
              )}
            </div>

            {/* Password strength indicator */}
            {password.length > 0 && (
              <div>
                <div style={{ height: '4px', borderRadius: '4px', background: 'var(--border-medium)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    borderRadius: '4px',
                    width: password.length < 6 ? '25%' : password.length < 10 ? '60%' : '100%',
                    background: password.length < 6 ? '#ef4444' : password.length < 10 ? '#f59e0b' : '#10b981',
                    transition: 'width 0.3s, background 0.3s',
                  }} />
                </div>
                <p className="text-xs text-muted mt-1">
                  {password.length < 6 ? 'Too short' : password.length < 10 ? 'Good' : '✅ Strong'}
                </p>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-lg w-full animate-pulse-glow mt-2"
              disabled={status === 'loading' || !token || password !== confirm}
            >
              {status === 'loading' ? '⏳ Resetting...' : '🔑 Reset Password'}
            </button>

            <p className="text-center text-sm text-muted">
              Remember your password?{' '}
              <Link to="/login" className="text-primary font-bold hover:underline">Sign In</Link>
            </p>
          </form>
        )}
      </div>
    </section>
  );
};

export default ResetPassword;
