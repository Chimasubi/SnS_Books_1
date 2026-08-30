import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { BookWithAuthor } from '@/types';
import { listBooks } from '@/services/books.service';
import { useAuth } from '@/context/AuthContext';
import { usePageMeta } from '@/hooks/usePageMeta';
import { BookGrid } from '@/components/BookCard';
import { CoverArt } from '@/components/CoverArt';
import { SkeletonBookGrid, EmptyState } from '@/components/ui';
import { IconArrowRight, IconBookOpen } from '@/components/icons';
import { AUTHOR_NAME, AUTHOR_ALIAS } from '@/config/site';

export function Home() {
  usePageMeta({
    title: 'A premium digital home for stories',
    description: `Discover the books, experiences and ideas of ${AUTHOR_NAME} on SNS Books.`,
  });
  const { user } = useAuth();
  const [books, setBooks] = useState<BookWithAuthor[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listBooks({ status: 'published' })
      .then(setBooks)
      .finally(() => setLoading(false));
  }, []);

  const featured = books?.filter((b) => b.featured); 
  const heroBook = featured?.[0] ?? books?.[0];

  return (
    <>
      <section className="hero">
        <div className="hero-aura" aria-hidden="true" />
        <div className="container hero-inner">
          <div>
            <p className="hero-kicker">Simulizi na Sauti · SNS Books · {AUTHOR_ALIAS}</p>
            <h1>
              <span className="hero-line">STORIES.</span>
              <span className="hero-line">LIVES.</span>
              <span className="hero-line orange">LEGACIES.</span>
            </h1>
            <p className="hero-sub">
              Discover the books, experiences and ideas of {AUTHOR_NAME}, {AUTHOR_ALIAS}.
            </p>
            <div className="hero-ctas">
              <Link to="/books" className="btn btn-primary">
                Explore Books <IconArrowRight size={16} />
              </Link>
              <Link to="/author" className="btn btn-outline">
                Meet the Author
              </Link>
            </div>
            <p className="hero-note">
              A premium digital home for stories · Structured reading · On every device
            </p>
          </div>
          <HeroVisual heroBook={heroBook ?? null} />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="stripes">
            <div className="stripe">
              <span className="stripe-num">05</span>
              <span className="stripe-label">Books in the launch collection</span>
            </div>
            <div className="stripe">
              <span className="stripe-num">01</span>
              <span className="stripe-label">Author · Fredrick Bundala</span>
            </div>
            <div className="stripe">
              <span className="stripe-num">∞</span>
              <span className="stripe-label">A growing SNS publishing ecosystem</span>
            </div>
            <div className="stripe">
              <span className="stripe-num">TZS · USD · EUR · GBP</span>
              <span className="stripe-label">Read anywhere, pay the way you like</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">The Collection</p>
              <h2 className="mt-2">THE COLLECTION</h2>
              <p className="collection-note mt-3">Five books. One remarkable journey.</p>
            </div>
            <Link to="/books" className="btn btn-ghost">
              View All <IconArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <SkeletonBookGrid />
          ) : !books || books.length === 0 ? (
            <EmptyState
              title="The collection is being prepared"
              body="New titles are on their way. Check back soon."
            />
          ) : (
            <BookGrid books={books.slice(0, 5)} />
          )}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <blockquote className="quote-block">
            <span className="quote-block-mark" aria-hidden="true">“</span>
            <p className="quote-block-text">
              A premium digital home for stories, books, experiences and legacies.
            </p>
            <p className="quote-block-credit">SNS BOOKS</p>
          </blockquote>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta-banner">
            <div>
              <h2>Start with a free chapter.</h2>
              <p>
                Every SNS book opens with a free sample chapter. If you love the story,
                the complete book joins your library in one step.
              </p>
            </div>
            <div className="row">
              <Link to="/library" className="btn btn-primary">
                <IconBookOpen size={16} /> {user ? 'Open My Library' : 'Sign In to Library'}
              </Link>
              <Link to="/books" className="btn btn-ghost">
                Browse Books
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">The Author</p>
              <h2 className="mt-2">THE MAN BEHIND THE STORIES</h2>
            </div>
            <Link to="/author" className="btn btn-ghost">
              Meet Him <IconArrowRight size={16} />
            </Link>
          </div>
          <div className="cta-banner">
            <div>
              <p className="hero-kicker" style={{ marginBottom: 'var(--space-3)' }}>
                {AUTHOR_NAME}
              </p>
              <p className="collection-note" style={{ maxWidth: 480 }}>
                Journalist · Media leader · Founder of Simulizi na Sauti. Discover the journey
                behind the five books of the launch collection.
              </p>
            </div>
            <Link to="/author" className="btn btn-outline">
              His Journey <IconArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function HeroVisual({ heroBook }: { heroBook: BookWithAuthor | null }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="hero-visual">
      <div className="hero-book-halo" aria-hidden="true" />
      {!imgError ? (
        <div className="hero-photo-frame">
          <img
            className="hero-photo"
            src={HERO_IMAGE}
            alt={`${AUTHOR_NAME} — ${AUTHOR_ALIAS}`}
            onError={() => setImgError(true)}
          />
          <div className="hero-photo-welcome">
            <span className="hero-photo-welcome-label">Welcome · {AUTHOR_ALIAS}</span>
            <span className="hero-photo-welcome-name">{AUTHOR_NAME}</span>
          </div>
        </div>
      ) : heroBook ? (
        <CoverArt book={heroBook} className="hero-book" />
      ) : (
        <div className="hero-book-halo" aria-hidden="true" />
      )}
      {heroBook && (
        <>
          <div className="hero-tag hero-tag-2">
            by <strong>{heroBook.author?.name ?? AUTHOR_NAME}</strong>
          </div>
        </>
      )}
    </div>
  );
}

const HERO_IMAGE = '/walker/main.jpg';