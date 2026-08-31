import { Link } from 'react-router-dom';
import { APP_SHORT_NAME } from '@/config/site';
import { IconBook } from '@/components/icons';

export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <Link to="/" className={`logo logo-${size}`} aria-label={`${APP_SHORT_NAME} home`}>
      <span className="logo-mark" aria-hidden="true">
        <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </span>
      <span className="logo-text">
        <span className="logo-word">SNS</span>
        <span className="logo-word logo-word-dim">BOOKS</span>
      </span>
    </Link>
  );
}