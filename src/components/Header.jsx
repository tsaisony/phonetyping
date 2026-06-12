import { Link, useLocation } from 'react-router-dom';
import { Camera, BookOpen, ChevronLeft } from 'lucide-react';

export default function Header() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <header className="glass" style={{
      padding: '1rem',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {!isHome && (
          <Link to="/" style={{ color: 'var(--text-main)', textDecoration: 'none', display: 'flex' }}>
            <ChevronLeft size={24} />
          </Link>
        )}
        <Link to="/" style={{ color: 'var(--text-main)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BookOpen className="text-primary" size={24} color="var(--primary)" />
          <h1 style={{ fontSize: '1.25rem', margin: 0 }}>Nihongo Lens</h1>
        </Link>
      </div>
      {isHome && (
        <Link to="/camera" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
          <Camera size={18} />
          <span>拍照</span>
        </Link>
      )}
    </header>
  );
}
