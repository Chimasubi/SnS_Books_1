import { useState } from 'react';
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { usePageMeta } from '@/hooks/usePageMeta';
import { Logo } from '@/components/Logo';
import {
  IconBook,
  IconChart,
  IconDollar,
  IconHome,
  IconSettings,
  IconShield,
  IconUsers,
  IconX,
  IconMenu,
  IconEdit,
} from '@/components/icons';

const NAV_GROUPS = [
  {
    label: 'General',
    links: [
      { to: '/admin', label: 'Dashboard', icon: <IconHome size={17} />, end: true },
      { to: '/admin/analytics', label: 'Analytics', icon: <IconChart size={17} /> },
      { to: '/admin/settings', label: 'Settings', icon: <IconSettings size={17} /> },
    ],
  },
  {
    label: 'Content',
    links: [
      { to: '/admin/books', label: 'Books', icon: <IconBook size={17} /> },
      { to: '/admin/authors', label: 'Authors', icon: <IconEdit size={17} /> },
    ],
  },
  {
    label: 'Commerce',
    links: [
      { to: '/admin/orders', label: 'Orders', icon: <IconDollar size={17} /> },
      { to: '/admin/payments', label: 'Payments', icon: <IconShield size={17} /> },
    ],
  },
  {
    label: 'Users',
    links: [
      { to: '/admin/users', label: 'Readers & Admins', icon: <IconUsers size={17} /> },
    ],
  },
];

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="admin-nav" aria-label="Admin">
      {NAV_GROUPS.map((group) => (
        <div key={group.label}>
          <p className="admin-sidebar-label">{group.label}</p>
          {group.links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => `admin-nav-link ${isActive ? 'admin-nav-link-active' : ''}`}
              onClick={onNavigate}
            >
              {l.icon} {l.label}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  );
}

function pageTitleFromPath(pathname: string): string {
  if (pathname === '/admin') return 'Dashboard';
  const map: Record<string, string> = {
    books: 'Books',
    analytics: 'Analytics',
    settings: 'Settings',
    authors: 'Authors',
    orders: 'Orders',
    payments: 'Payments',
    users: 'Users',
  };
  const key = pathname.replace('/admin/', '').split('/')[0];
  return map[key] ?? 'Admin';
}

export function AdminLayout() {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  usePageMeta({ title: `Admin · ${pageTitleFromPath(pathname)}`, noindex: true });

  return (
    <div className="admin">
      <div className="admin-shell">
        <aside className="admin-sidebar">
          <div className="admin-sidebar-head">
            <Logo />
            <p className="admin-sidebar-label" style={{ margin: 'var(--space-4) 0 0' }}>
              SNS BOOKS ADMIN
            </p>
          </div>
          <SidebarNav />
          <div className="mt-5" style={{ padding: 'var(--space-3)', borderTop: '1px solid var(--sns-border)' }}>
            <Link to="/" className="admin-nav-link">← Back to site</Link>
          </div>
        </aside>

        <div className="admin-main">
          <header className="admin-topbar">
            <div className="admin-topbar-title">
              <h1>{pageTitleFromPath(pathname)}</h1>
              <p>{user?.email}</p>
            </div>
            <button className="icon-btn" onClick={() => setMobileOpen((v) => !v)} aria-label="Toggle admin menu" aria-expanded={mobileOpen}>
              {mobileOpen ? <IconX size={20} /> : <IconMenu size={20} />}
            </button>
          </header>

          {mobileOpen && (
            <div className="panel panel-pad mb-4">
              <SidebarNav onNavigate={() => setMobileOpen(false)} />
            </div>
          )}

          <div className="admin-mobile-nav">
            {NAV_GROUPS.flatMap((g) => g.links).map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className="filter-btn">
                {l.label}
              </NavLink>
            ))}
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
}