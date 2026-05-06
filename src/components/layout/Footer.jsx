import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={{
      marginTop: 'auto',
      borderTop: '1px solid var(--border-subtle)',
      background: '#fff',
      padding: 'var(--space-12) 0 var(--space-8)'
    }}>
      <div className="container grid grid-4 gap-8 footer-grid" style={{ paddingBottom: 'var(--space-8)' }}>
        <div className="flex flex-col gap-4">
          <Link to="/" className="text-xl font-extrabold text-gradient" style={{ letterSpacing: '-0.5px' }}>
            EduMarket
          </Link>
          <p className="text-muted text-sm" style={{ lineHeight: '1.7', marginTop: '0.5rem' }}>
            Share & discover study notes from Std 1 to Master's degree. Upload, digitalize with AI, and earn by helping others learn.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="font-semibold text-lg" style={{ marginBottom: '0.5rem' }}>Platform</h4>
          <ul className="flex flex-col gap-3">
            <li><Link to="/browse" className="text-muted text-sm hover:text-accent" style={{ transition: 'color var(--transition-fast)' }}>Browse Notes</Link></li>
            <li><Link to="/upload" className="text-muted text-sm hover:text-accent" style={{ transition: 'color var(--transition-fast)' }}>Upload Notes</Link></li>
            <li><Link to="/dashboard" className="text-muted text-sm hover:text-accent" style={{ transition: 'color var(--transition-fast)' }}>Dashboard</Link></li>
            <li><Link to="/chat" className="text-muted text-sm hover:text-accent" style={{ transition: 'color var(--transition-fast)' }}>Messages</Link></li>
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="font-semibold text-lg" style={{ marginBottom: '0.5rem' }}>Company</h4>
          <ul className="flex flex-col gap-3">
            <li><a href="/#vision" className="text-muted text-sm hover:text-accent" style={{ transition: 'color var(--transition-fast)' }}>Our Vision</a></li>
            <li><Link to="#" className="text-muted text-sm hover:text-accent" style={{ transition: 'color var(--transition-fast)' }}>About Us</Link></li>
            <li><Link to="#" className="text-muted text-sm hover:text-accent" style={{ transition: 'color var(--transition-fast)' }}>Contact</Link></li>
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="font-semibold text-lg" style={{ marginBottom: '0.5rem' }}>Legal</h4>
          <ul className="flex flex-col gap-3">
            <li><Link to="#" className="text-muted text-sm hover:text-accent" style={{ transition: 'color var(--transition-fast)' }}>Privacy Policy</Link></li>
            <li><Link to="#" className="text-muted text-sm hover:text-accent" style={{ transition: 'color var(--transition-fast)' }}>Terms of Service</Link></li>
            <li><Link to="#" className="text-muted text-sm hover:text-accent" style={{ transition: 'color var(--transition-fast)' }}>Cookie Policy</Link></li>
          </ul>
        </div>
      </div>

      <div className="container flex items-center justify-between footer-bottom" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-6)', marginTop: 'var(--space-4)' }}>
        <p className="text-muted text-sm">© {new Date().getFullYear()} EduMarket. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="#" className="text-muted hover:text-accent" style={{ transition: 'color var(--transition-fast)' }}>
            <span className="btn-icon flex items-center justify-center" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '50%' }}>𝕏</span>
          </a>
          <a href="#" className="text-muted hover:text-accent" style={{ transition: 'color var(--transition-fast)' }}>
            <span className="btn-icon flex items-center justify-center" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '50%' }}>in</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
