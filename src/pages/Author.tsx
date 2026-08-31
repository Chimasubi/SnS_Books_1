import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Author, BookWithAuthor } from '@/types';
import { PRIMARY_AUTHOR_ID } from '@/config/site';
import { usePageMeta } from '@/hooks/usePageMeta';
import { listBooks } from '@/services/books.service';
import { db, getAuthor } from '@/lib/store';
import { BookGrid } from '@/components/BookCard';
import { Reveal } from '@/components/Reveal';
import { EmptyState, Skeleton } from '@/components/ui';
import { AUTHOR_NAME, AUTHOR_ALIAS } from '@/config/site';

export function Author() {
  usePageMeta({
    title: 'The Author',
    description: `Meet ${AUTHOR_NAME} — journalist, media leader and author of the SNS Books launch collection.`,
  });
  const [author, setAuthor] = useState<Author | null>(null);
  const [books, setBooks] = useState<BookWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const a = db.read<Author>('authors').find((x) => x.id === PRIMARY_AUTHOR_ID) ?? getAuthor(PRIMARY_AUTHOR_ID) ?? null;
    setAuthor(a);
    listBooks().then((b) => setBooks(b)).finally(() => setLoading(false));
  }, []);

  if (!author) {
    return (
      <div className="container section">
        <EmptyState
          title="Author profile coming soon"
          body="The author profile is being prepared."
          action={<Link to="/books" className="btn btn-primary">Browse books</Link>}
        />
      </div>
    );
  }

  return (
    <div className="container">
      <section className="section" style={{ paddingTop: 'var(--space-7)' }}>
        <Reveal>
          <p className="eyebrow">SNS Books · Author</p>
          <h1 className="page-title mt-2">THE MAN BEHIND THE STORIES</h1>
          <p className="page-sub">{author.tagline}</p>
        </Reveal>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <Reveal>
          <div className="author-hero">
            <div className="author-portrait">
              <img
                className="author-portrait-img"
                src={AUTHOR_PORTRAIT}
                alt={`${author.name} — ${AUTHOR_ALIAS}`}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <span className="author-portrait-placeholder">SNS</span>
            </div>
            <div>
              <div className="row-between flex-wrap mb-3">
                <div>
                  <span className="chip mb-2">{author.badge}</span>
                  <h2 className="mt-2" style={{ fontSize: 'var(--fs-3xl)' }}>{author.name}</h2>
                  <p className="author-alias">“{AUTHOR_ALIAS}”</p>
                </div>
              </div>
              {author.bio.map((p, i) => (
                <p key={i} className="muted mt-3" style={{ lineHeight: 'var(--lh-relaxed)', maxWidth: 620 }}>
                  {p}
                </p>
              ))}
              <div className="author-stats">
                {author.stats.map((s) => (
                  <div key={s.label} className="author-stat">
                    <span className="author-stat-value">{s.value}</span>
                    <span className="author-stat-label">{s.label}</span>
                  </div>
                ))}
              </div>
              {author.quote && (
                <p className="mt-5 muted" style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 'var(--fs-lg)', maxWidth: 600 }}>
                  “{author.quote}”
                </p>
              )}
              {author.portraitNote && (
                <p className="mt-3" style={{ fontSize: 'var(--fs-xs)', color: 'var(--sns-muted-2)' }}>
                  {author.portraitNote}
                </p>
              )}
            </div>
          </div>
        </Reveal>
      </section>

      <section className="section" id="journey" style={{ paddingTop: 0 }}>
        <Reveal>
          <div className="section-head">
            <div>
              <p className="eyebrow">His Journey</p>
              <h2 className="mt-2">TIMELINE</h2>
            </div>
            <span className="chip">Content managed via admin</span>
          </div>
        </Reveal>
        <div className="timeline">
          {author.timeline.map((t, i) => (
            <Reveal key={t.id} delay={Math.min(i, 5) * 80}>
              <div className="timeline-item">
                <span className="timeline-label">{t.label}</span>
                <h3 className="timeline-title">{t.title}</h3>
                <p className="timeline-body">{t.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <Reveal>
          <div className="section-head">
            <div>
              <p className="eyebrow">The Books</p>
              <h2 className="mt-2">BOOK COLLECTION</h2>
            </div>
            <Link to="/books" className="btn btn-ghost">All Books</Link>
          </div>
        </Reveal>
        {loading ? (
          <Skeleton style={{ height: 200 }} />
        ) : books.length === 0 ? (
          <EmptyState title="No books published yet" body="The collection is being prepared." />
        ) : (
          <BookGrid books={books} />
        )}
      </section>
    </div>
  );
}

const AUTHOR_PORTRAIT = '/walker/main.jpg';