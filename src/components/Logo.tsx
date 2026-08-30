import { Link } from 'react-router-dom';
import { APP_SHORT_NAME } from '@/config/site';
import { IconBook } from '@/components/icons';

export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <Link to="/" className={`logo logo-${size}`} aria-label={`${APP_SHORT_NAME} home`}>
      <span className="logo-mark" aria-hidden="true">
        <IconBook size={size === 'sm' ? 16 : size === 'lg' ? 26 : 20} />
      </span>
      <span className="logo-text">
        <span className="logo-word">SNS</span>
        <span className="logo-word logo-word-dim">BOOKS</span>
      </span>
    </Link>
  );
}