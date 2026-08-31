import { usePageMeta } from '@/hooks/usePageMeta';
import { Reveal } from '@/components/Reveal';
import { BRAND_NAME, TAGLINE } from '@/config/site';
import { IconShield, IconBookOpen, IconHeadphones, IconFileText, IconUsers } from '@/components/icons';

function IconGlobe({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a15 15 0 0 1 0 18" />
      <path d="M12 3a15 15 0 0 0 0 18" />
    </svg>
  );
}

const FEATURES = [
  {
    icon: <IconBookOpen size={20} />,
    title: 'Structured digital reading',
    body: 'Books are built as structured chapters for a comfortable, focused reading experience — not loose PDF downloads.',
  },
  {
    icon: <IconShield size={20} />,
    title: 'Access that respects the work',
    body: 'Entitlement-based access with secure distribution. Purchases are tied to your account and your library.',
  },
  {
    icon: <IconHeadphones size={20} />,
    title: 'A future of formats ahead',
    body: 'Audiobooks, subscriptions and more formats are being prepared for the SNS publishing ecosystem.',
  },
  {
    icon: <IconGlobe size={20} />,
    title: 'International by design',
    body: 'Read from Tanzania, across Africa, in the United States, Europe and beyond — with pricing in TZS, USD, EUR and GBP.',
  },
  {
    icon: <IconFileText size={20} />,
    title: 'A publishing platform',
    body: 'SNS Books is the digital home of Simulizi na Sauti — built to grow with hundreds of books and many authors.',
  },
  {
    icon: <IconUsers size={20} />,
    title: 'A community of readers',
    body: 'Libraries, bookmarks, reading history and upcoming reader features put your stories within reach, everywhere.',
  },
];

export function About() {
  usePageMeta({
    title: 'About SNS',
    description: `About ${BRAND_NAME} and the SNS Books digital publishing platform.`,
  });

  return (
    <div className="container">
      <section className="section" style={{ paddingTop: 'var(--space-7)' }}>
        <Reveal>
          <p className="eyebrow">Simulizi na Sauti</p>
          <h1 className="page-title mt-2">ABOUT SNS BOOKS</h1>
          <p className="page-sub" style={{ maxWidth: 640 }}>
            SNS Books is the digital publishing arm of Simulizi na Sauti (SNS) — a premium home
            for stories, books, experiences and legacies. It opens with five books by
            Fredrick Bundala, and is built to grow into a full publishing ecosystem.
          </p>
          <p className="mt-5" style={{ color: 'var(--sns-text-secondary)', lineHeight: 'var(--lh-relaxed)', maxWidth: 640 }}>
            {TAGLINE} The platform brings the SNS brand — cinematic, African, premium and
            editorial — to a serious digital reading experience.
          </p>
        </Reveal>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <Reveal>
          <div className="section-head">
            <div>
              <p className="eyebrow">The platform</p>
              <h2 className="mt-2">WHAT SNS BOOKS OFFERS</h2>
            </div>
          </div>
        </Reveal>
        <div className="about-features">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={Math.min(i, 5) * 70}>
              <div className="about-feature">
                <span className="orange">{f.icon}</span>
                <h3 className="mt-3">{f.title}</h3>
                <p>{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <Reveal>
          <div className="quote-block">
            <span className="quote-block-mark" aria-hidden="true">“</span>
            <p className="quote-block-text">Stories. Lives. Legacies.</p>
            <p className="quote-block-credit">SNS BOOKS</p>
          </div>
        </Reveal>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <Reveal>
          <div className="about-section" id="help">
            <h2>HELP & SUPPORT</h2>
            <p>
              Need help with reading, your library, or a purchase? Reach the SNS Books support
              team and we will respond as quickly as possible. Visit the contact section below.
            </p>
          </div>
        </Reveal>
        <Reveal>
          <div className="about-section" id="contact">
            <h2>CONTACT</h2>
            <p>
              For reader support, author enquiries and publishing partnerships, email the SNS
              Books team. Contact details will be confirmed on this page as the platform launches.
            </p>
          </div>
        </Reveal>
        <Reveal>
          <div className="about-section" id="terms">
            <h2>TERMS</h2>
            <p>
              Your purchases grant you a personal, non-transferable right to read the books you
              own through your SNS Books library. Full terms of service will be published before
              launch. Placeholder text — replace through the admin before going live.
            </p>
          </div>
        </Reveal>
        <Reveal>
          <div className="about-section" id="privacy">
            <h2>PRIVACY</h2>
            <p>
              SNS Books stores only the account, purchase and reading information needed to run
              your library. We do not sell personal data. A full privacy policy will be published
              before launch. Placeholder text — replace through the admin before going live.
            </p>
          </div>
        </Reveal>
      </section>
    </div>
  );
}