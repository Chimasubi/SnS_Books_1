import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { CurrencyCode } from '@/types';
import { getBookDetail, type BookDetail } from '@/services/books.service';
import { useAuth } from '@/context/AuthContext';
import { usePageMeta } from '@/hooks/usePageMeta';
import { getSettings, convertAmount, computePrice, hasEntitlement } from '@/lib/store';
import { CoverArt } from '@/components/CoverArt';
import { BookGrid } from '@/components/BookCard';
import { Skeleton, EmptyState, Button } from '@/components/ui';
import {
  IconBookOpen,
  IconArrowRight,
  IconClock,
  IconCheck,
  IconLock,
  IconShield,
  IconDownload,
} from '@/components/icons';
import { formatMoney } from '@/lib/format';
import { estimateReadMinutes } from '@/services/reader.service';

export function BookDetails() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [detail, setDetail] = useState<BookDetail | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [currency, setCurrency] = useState<CurrencyCode>(getSettings().defaultCurrency);

  useEffect(() => {
    if (!slug) return;
    setDetail(null);
    setNotFound(false);
    getBookDetail(slug).then((d) => {
      if (!d) setNotFound(true);
      else setDetail(d);
    });
  }, [slug]);

  usePageMeta({
    title: detail ? `${detail.book.title} · ${detail.book.eduNumber}` : undefined,
    description: detail?.book.description,
  });

  const book = detail?.book;
  const chapters = detail?.chapters ?? [];

  const price = useMemo(() => (book ? computePrice(book, currency) : null), [book, currency]);
  const owned = book ? user !== null && hasEntitlement(user.id, book.id) : false;

  const firstChapter = chapters[0] ?? null;
  const hasSample = book ? book.sampleCount > 0 && chapters.length > 0 : false;
  const readMinutes = chapters.reduce((sum, c) => sum + estimateReadMinutes(c.content), 0);

  if (notFound) {
    return (
      <div className="container">
        <EmptyState
          title="Book not found"
          body="We couldn't find that book. It may have been unpublished or moved."
          action={<Link to="/books" className="btn btn-primary">Browse all books</Link>}
        />
      </div>
    );
  }

  if (!detail || !book || !price) {
    return (
      <div className="container section">
        <div className="book-detail">
          <Skeleton style={{ aspectRatio: '2 / 3', borderRadius: 'var(--radius-lg)' }} />
          <div className="stack">
            <Skeleton style={{ height: 16, width: 120 }} />
            <Skeleton style={{ height: 44, width: '80%' }} />
            <Skeleton style={{ height: 20, width: '50%' }} />
            <Skeleton style={{ height: 90, width: '100%' }} />
          </div>
        </div>
      </div>
    );
  }

  const locales = getSettings().currenciesEnabled;

  const goFirstReadable = () => {
    if (owned) {
      navigate(`/read/${book.id}`);
    } else if (hasSample && firstChapter) {
      navigate(`/read/${book.id}/${firstChapter.id}`);
    }
  };

  return (
    <div className="container">
      <section className="section" style={{ paddingTop: 'var(--space-7)' }}>
        <div className="book-detail">
          <div className="book-detail-cover">
            <CoverArt book={book} />
            {book.demo && (
              <p className="muted mt-3" style={{ fontSize: 'var(--fs-xs)' }}>
                DEMO EDITION · Placeholder content for demonstration
              </p>
            )}
          </div>

          <div className="book-detail-info">
            <div className="book-detail-edition">
              {book.eduNumber}
              <span className="chip chip-highlight">
                {book.status === 'coming_soon' ? 'Coming Soon' : book.featured ? 'Featured' : 'Available'}
              </span>
            </div>
            <h1 className="book-detail-title">{book.title}</h1>
            <p className="book-detail-subtitle">{book.subtitle}</p>
            <p className="book-detail-author">
              by{' '}
              <Link to="/author">{book.author?.name ?? 'SNS Books'}</Link>
            </p>
            <p className="book-detail-desc">{book.description}</p>

            <div className="book-detail-meta">
              <span className="chip">
                <IconBookOpen size={13} /> {chapters.length} chapters
              </span>
              <span className="chip">
                <IconClock size={13} /> ~{Math.max(1, Math.round(readMinutes / 5)) * 5} min reading
              </span>
              <span className="chip">{book.category}</span>
            </div>

            <div className="book-detail-price">
              <span className="book-detail-price-main">{formatMoney(price.amount, price.currency)}</span>
              {book.price.currency !== price.currency && (
                <span className="book-detail-price-usd">
                  ≈ {formatMoney(convertAmount(book.price.amount, book.price.currency, book.price.currency), book.price.currency)} · base price
                </span>
              )}
            </div>

            <div className="book-detail-actions">
              {book.status === 'coming_soon' ? (
                <>
                  <Button disabled>Coming Soon</Button>
                  {hasSample && firstChapter && (
                    <Button variant="outline" onClick={() => navigate(`/read/${book.id}/${firstChapter.id}`)}>
                      <IconBookOpen size={16} /> Read Sample
                    </Button>
                  )}
                </>
              ) : owned ? (
                <>
                  <Button onClick={() => navigate(`/read/${book.id}/${firstChapter?.id ?? book.id}`)}>
                    <IconBookOpen size={16} /> {firstChapter ? 'Start Reading' : 'Open Book'}
                  </Button>
                  <Button variant="ghost" onClick={() => navigate('/library')}>In Your Library</Button>
                </>
              ) : (
                <>
                  <Button onClick={() => navigate(`/checkout/${book.id}`)}>
                    Buy E-Book <IconArrowRight size={16} />
                  </Button>
                  {hasSample && firstChapter && (
                    <Button variant="outline" onClick={() => navigate(`/read/${book.id}/${firstChapter.id}`)}>
                      <IconBookOpen size={16} /> Read Sample
                    </Button>
                  )}
                </>
              )}
            </div>

            <div className="row" style={{ gap: 'var(--space-3)' }}>
              <label className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span className="field-label">Show price in</span>
                <select
                  className="select"
                  style={{ minWidth: 110, minHeight: 36, padding: 'var(--space-1) var(--space-3)' }}
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                  aria-label="Currency"
                >
                  {locales.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="row muted" style={{ fontSize: 'var(--fs-xs)', gap: 'var(--space-4)' }}>
              <span className="row" style={{ gap: 'var(--space-1)' }}>
                <IconShield size={14} /> Secure payment
              </span>
              <span className="row" style={{ gap: 'var(--space-1)' }}>
                <IconLock size={14} /> Instant access after purchase
              </span>
              <span className="row" style={{ gap: 'var(--space-1)' }}>
                <IconDownload size={14} /> Read on any device
              </span>
            </div>
          </div>
        </div>
      </section>

      {book.demo && (
        <section className="section-block container-narrow text-center">
          <p className="eyebrow">Demo content</p>
          <p className="mt-2 muted">
            This listing uses realistic placeholder content so the platform can be fully
            demonstrated. Final titles, covers and copy are managed through the admin.
          </p>
        </section>
      )}

      <section className="section-block" id="about">
        <h2>ABOUT THE BOOK</h2>
        {book.about.split(/\n{2,}/).map((p, i) => (
          <p key={i} className="mt-3">{p}</p>
        ))}
      </section>

      {book.whatsInside.length > 0 && (
        <section className="section-block" id="inside">
          <h2>WHAT YOU'LL DISCOVER</h2>
          <ul className="whats-inside">
            {book.whatsInside.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="section-block" id="chapters">
        <div className="row-between mb-4">
          <h2 style={{ marginBottom: 0 }}>CHAPTERS</h2>
          <span className="chip">{chapters.length} chapters</span>
        </div>
        {chapters.length === 0 ? (
          <EmptyState title="Chapters coming soon" body="The full chapter list for this book is being prepared." />
        ) : (
          <div className="chapter-list">
            {chapters.map((ch, i) => {
              const free = i < book.sampleCount;
              return (
                <button
                  key={ch.id}
                  className="chapter-row"
                  style={{ width: '100%', background: 'transparent', borderBottom: '1px solid var(--sns-border)', textAlign: 'left' }}
                  onClick={() => navigate(`/read/${book.id}/${ch.id}`)}
                >
                  <span className="chapter-row-num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="chapter-row-title">{ch.title}</span>
                  <span className="chapter-row-meta">
                    {free ? (
                      <span className="row" style={{ gap: 4 }}><IconCheck size={13} /> Free sample</span>
                    ) : (
                      <span className="row" style={{ gap: 4 }}><IconLock size={13} /> Full book</span>
                    )}
                    <IconArrowRight size={14} />
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section className="section-block" id="author">
        <div className="row-between mb-4">
          <h2 style={{ marginBottom: 0 }}>THE AUTHOR</h2>
          <Link to="/author" className="btn btn-ghost btn-sm">Full profile <IconArrowRight size={14} /></Link>
        </div>
        <p className="muted" style={{ lineHeight: 'var(--lh-relaxed)', maxWidth: 640 }}>
          {book.author?.tagline} · {book.author?.badge}. Explore the story behind the
          launch collection.
        </p>
      </section>

      {detail.related.length > 0 && (
        <section className="section-block" id="related">
          <div className="section-head">
            <div>
              <p className="eyebrow">Continue exploring</p>
              <h2 className="mt-2">RELATED BOOKS</h2>
            </div>
            <Link to="/books" className="btn btn-ghost">All Books <IconArrowRight size={16} /></Link>
          </div>
          <BookGrid books={detail.related} />
        </section>
      )}

      <section className="cta-banner mt-6 mb-6">
        <div>
          {owned ? (
            <>
              <h2>Pick up where you left off.</h2>
              <p className="collection-note">Continue reading {book.title} in your library.</p>
            </>
          ) : (
            <>
              <h2>Ready to read {book.title}?</h2>
              <p className="collection-note">
                Start with the free sample chapter, then unlock the complete book.
              </p>
            </>
          )}
        </div>
        {owned ? (
          <Button onClick={() => goFirstReadable()}><IconBookOpen size={16} /> Resume Reading</Button>
        ) : (
          <Button onClick={() => navigate(`/checkout/${book.id}`)}>
            Get the Complete Book <IconArrowRight size={16} />
          </Button>
        )}
      </section>
    </div>
  );
}