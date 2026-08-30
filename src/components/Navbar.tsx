import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { SearchOverlay } from '@/components/SearchOverlay';
import { useAuth } from '@/context/AuthContext';
import { Logo } from '@/components/Logo';
import { IconSearch, IconMenu, IconX, IconLibrary, IconUser, IconArrowRight } from '@/components/icons';
import { NAV_LINKS } from '@/config/site';

export function Navbar() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const goSearch = (q: string) => {
    setSearchOpen(false);
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
  };

  return (
    <>
      <header className={`nav ${scrolled ? 'nav-scrolled' : ''}`}>
        <div className="container nav-inner">
          <Logo />
          <nav className="nav-links" aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="nav-actions">
            <button
              className="icon-btn nav-search-trigger"
              onClick={() => setSearchOpen(true)}
              aria-label="Search books"
            >
              <IconSearch size={20} />
            </button>
            {user ? (
              <div className="nav-auth">
                <Link to="/library" className="nav-auth-link" aria-label="My Library">
                  <IconLibrary size={20} />
                  <span className="nav-auth-label">My Library</span>
                </Link>
                <Link to="/account" className="nav-auth-user" aria-label="Account">
                  <span className="nav-avatar" aria-hidden="true">
                    {user.name.slice(0, 1).toUpperCase()}
                  </span>
                </Link>
              </div>
            ) : (
              <Link to="/login" className="btn btn-outline btn-sm nav-signin">
                Sign In
              </Link>
            )}
            <button className="icon-btn nav-burger" onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open}>
              <IconMenu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div className={`drawer ${open ? 'drawer-open' : ''}`} aria-hidden={!open}>
        <div className="drawer-backdrop" onClick={() => setOpen(false)} />
        <div className="drawer-panel" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="drawer-head">
            <Logo />
            <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close menu">
              <IconX size={22} />
            </button>
          </div>
          <nav className="drawer-nav" aria-label="Mobile">
            {NAV_LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} className="drawer-link">
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="drawer-foot">
            {user ? (
              <div className="stack-sm">
                <Link to="/library" className="btn btn-outline btn-block">
                  <IconLibrary size={16} /> My Library
                </Link>
                <Link to="/account" className="btn btn-ghost btn-block">
                  <IconUser size={16} /> Account
                </Link>
                {user.role === 'ADMIN' && (
                  <Link to="/admin" className="btn btn-ghost btn-block">Admin Dashboard</Link>
                )}
              </div>
            ) : (
              <div className="stack-sm">
                <Link to="/login" className="btn btn-primary btn-block">
                  Sign In <IconArrowRight size={16} />
                </Link>
                <Link to="/register" className="btn btn-ghost btn-block">Create account</Link>
              </div>
            )}
            <p className="drawer-tagline">Stories. Lives. Legacies.</p>
          </div>
        </div>
      </div>

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} onSearch={goSearch} />}
    </>
  );
}