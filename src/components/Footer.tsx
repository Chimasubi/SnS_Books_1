import { Link } from 'react-router-dom';
import { BRAND_NAME, TAGLINE } from '@/config/site';
import { Logo } from '@/components/Logo';

const COLUMNS = [
  {
    heading: 'BOOKS',
    links: [
      { label: 'All Books', to: '/books' },
      { label: 'Featured', to: '/books?featured=1' },
      { label: 'Coming Soon', to: '/books?status=coming_soon' },
    ],
  },
  {
    heading: 'AUTHOR',
    links: [
      { label: "Fredrick Bundala 'The SkyWalker'", to: '/author' },
      { label: 'His Journey', to: '/author#journey' },
    ],
  },
  {
    heading: 'SUPPORT',
    links: [
      { label: 'Help', to: '/about#help' },
      { label: 'Contact', to: '/about#contact' },
      { label: 'Terms', to: '/about#terms' },
      { label: 'Privacy', to: '/about#privacy' },
    ],
  },
];

const SOCIAL = ['Instagram', 'YouTube', 'Facebook', 'TikTok'];

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Logo />
            <p className="footer-tagline">{TAGLINE}</p>
            <p className="footer-sns">{BRAND_NAME}</p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.heading} className="footer-col">
              <h4 className="footer-heading">{col.heading}</h4>
              <ul className="footer-links">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="footer-col">
            <h4 className="footer-heading">FOLLOW SNS</h4>
            <ul className="footer-links">
              {SOCIAL.map((s) => (
                <li key={s}>
                  <a href="#social" onClick={(e) => e.preventDefault()} className="footer-social">
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {year} SNS Books · Simulizi na Sauti. All rights reserved.</p>
          <p className="footer-note">A premium digital home for stories, books, experiences and legacies.</p>
        </div>
      </div>
    </footer>
  );
}