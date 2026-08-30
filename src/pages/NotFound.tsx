import { Link } from 'react-router-dom';
import { usePageMeta } from '@/hooks/usePageMeta';
import { IconBookOpen } from '@/components/icons';

export function NotFound() {
  usePageMeta({ title: 'Page not found', noindex: true });
  return (
    <div className="container">
      <div className="state section" style={{ marginTop: 'var(--space-7)' }}>
        <span className="state-icon"><IconBookOpen size={24} /></span>
        <h1 className="state-title">404 — PAGE NOT FOUND</h1>
        <p className="state-body">
          The page you're looking for doesn't exist, may have been moved, or is a private
          reader page that can't be accessed directly.
        </p>
        <div className="state-action">
          <Link to="/" className="btn btn-primary">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}