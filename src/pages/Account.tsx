import { Link, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { usePageMeta } from '@/hooks/usePageMeta';
import { logout } from '@/services/auth.service';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui';
import {
  IconUser,
  IconLibrary,
  IconBookmark,
  IconClock,
  IconShield,
  IconLogout,
} from '@/components/icons';
import { formatDate } from '@/lib/format';

function AccountProfile() {
  usePageMeta({ title: 'Account', noindex: true });
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  if (!user) return null;

  const doLogout = async () => {
    await logout();
    toast('You have been signed out.', 'info');
    navigate('/');
  };

  return (
    <div className="stack">
      <div className="panel panel-pad">
        <p className="eyebrow mb-2">Profile</p>
        <h2 className="mb-3" style={{ fontSize: 'var(--fs-2xl)' }}>{user.name}</h2>
        <p className="muted mb-2">{user.email}</p>
        <div className="row flex-wrap mt-3">
          <span className="chip">{user.role}</span>
          <span className="chip">{user.country}</span>
          <span className="chip">Member since {formatDate(user.createdAt)}</span>
        </div>
        <p className="form-note mt-4">
          Account roles: USER (reader) and ADMIN (admin dashboard). The AUTHOR role is reserved
          for future publishing workflows.
        </p>
      </div>

      <div className="panel panel-pad">
        <p className="eyebrow mb-2">Session & security</p>
        <p className="muted" style={{ lineHeight: 'var(--lh-relaxed)' }}>
          This demo uses a local session. In production your session is managed by the
          authentication service (e.g. Firebase Auth or the SNS backend), with password reset
          handled through secure email links.
        </p>
        <div className="row mt-4">
          <Button variant="danger" onClick={doLogout} icon={<IconLogout size={16} />}>Sign Out</Button>
        </div>
      </div>
    </div>
  );
}

const LINKS = [
  { label: 'Profile', to: '/account', end: true, icon: <IconUser size={17} /> },
  { label: 'My Library', to: '/library', icon: <IconLibrary size={17} /> },
  { label: 'Bookmarks', to: '/bookmarks', icon: <IconBookmark size={17} /> },
  { label: 'History', to: '/history', icon: <IconClock size={17} /> },
];

export function Account() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  if (!user) return null;

  const doLogout = async () => {
    await logout();
    toast('You have been signed out.', 'info');
    navigate('/');
  };

  return (
    <div className="container">
      <section className="section" style={{ paddingTop: 'var(--space-7)' }}>
        <p className="eyebrow">Your account</p>
        <h1 className="page-title mt-2">ACCOUNT</h1>
      </section>

      <div className="account-grid">
        <aside className="account-side">
          <div className="account-side-head">
            <span className="account-side-avatar" aria-hidden="true">{user.name.slice(0, 1).toUpperCase()}</span>
            <div>
              <strong style={{ display: 'block' }}>{user.name}</strong>
              <span className="muted" style={{ fontSize: 'var(--fs-xs)' }}>{user.email}</span>
            </div>
          </div>
          <nav className="account-side-nav" aria-label="Account">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => `account-side-link ${isActive ? 'account-side-link-active' : ''}`}>
                {l.icon} {l.label}
              </NavLink>
            ))}
            {user.role === 'ADMIN' && (
              <NavLink to="/admin" className="account-side-link">
                <IconShield size={17} /> Admin Dashboard
              </NavLink>
            )}
          </nav>
          <div style={{ padding: 'var(--space-4)' }}>
            <Button variant="ghost" block size="sm" onClick={doLogout} icon={<IconLogout size={15} />}>
              Sign Out
            </Button>
          </div>
        </aside>

        <div>
          <Routes>
            <Route index element={<AccountProfile />} />
            <Route path="*" element={<AccountProfile />} />
          </Routes>
          <p className="form-note mt-5">
            <Link to="/about#privacy">Privacy</Link> · <Link to="/about#terms">Terms</Link> · SNS Books
          </p>
        </div>
      </div>
    </div>
  );
}