import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { BookWithAuthor } from '@/types';
import { searchCatalog } from '@/services/books.service';
import { usePageMeta } from '@/hooks/usePageMeta';
import { BookGrid } from '@/components/BookCard';
import { EmptyState, Skeleton } from '@/components/ui';
import { IconClock, IconSearch } from '@/components/icons';

export function SearchPage() {
  usePageMeta({ title: 'Search', noindex: true });
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const [books, setBooks] = useState<BookWithAuthor[] | null>(null);
  const [chapters, setChapters] = useState<Awaited<ReturnType<typeof searchCatalog>>['chapters']>([]);
  const [ran, setRan] = useState(false);

  useEffect(() => {
    if (!query) {
      setBooks(null);
      setChapters([]);
      setRan(false);
      return;
    }
    setBooks(null);
    setRan(false);
    const t = window.setTimeout(async () => {
      const res = await searchCatalog(query);
      setBooks(res.books);
      setChapters(res.chapters);
      setRan(true);
    }, 200);
    return () => window.clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && query) {
        setParams({}, { replace: true });
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [query, setParams]);

  const total = useMemo(() => (books?.length ?? 0) + chapters.length, [books, chapters]);
  const busy = query.trim() !== '' && !books;

  const update = (value: string) => {
    if (value) setParams({ q: value }, { replace: true });
    else setParams({}, { replace: true });
  };

  return (
    <div className="container">
      <section className="section" style={{ paddingTop: 'var(--space-7)' }}>
        <p className="eyebrow">Search</p>
        <h1 className="page-title mt-2">SEARCH SNS BOOKS</h1>
        <div className="mt-5" style={{ maxWidth: 560 }}>
          <div className="search-input-row" style={{ border: '1px solid var(--sns-border)', borderRadius: 'var(--radius-md)', background: 'var(--sns-surface)' }}>
            <IconSearch size={20} className="orange" />
            <input
              className="search-input"
              placeholder="Search books, authors, topics, chapters…"
              value={query}
              onChange={(e) => update(e.target.value)}
              aria-label="Search books"
            />
          </div>
        </div>
      </section>

      {!query && (
        <section>
          <EmptyState
            icon={<IconSearch size={24} />}
            title="Type to search the catalogue"
            body="Search across book titles, authors, descriptions, categories and chapter titles."
          />
        </section>
      )}

      {query && busy && <Skeleton style={{ height: 220 }} className="mt-6" />}

      {query && !busy && ran && total === 0 && (
        <EmptyState
          title="No results found"
          body={`Nothing matched “${query}”. Try a different author, title or topic.`}
          action={<Link to="/books" className="btn btn-outline">Browse all books</Link>}
        />
      )}

      {query && !busy && ran && total > 0 && (
        <section className="mt-6">
          <p className="eyebrow mb-4">{total} result{total === 1 ? '' : 's'} for “{query}”</p>

          {chapters.length > 0 && (
            <div className="mb-6">
              <h2 className="mb-4" style={{ fontSize: 'var(--fs-xl)' }}>CHAPTERS</h2>
              <div className="chapter-list">
                {chapters.map((c) => (
                  <Link key={c.chapter.id} to={`/books/${c.book.slug}`} className="chapter-row">
                    <span className="chapter-row-num">
                      <IconClock size={15} />
                    </span>
                    <span className="chapter-row-title">{c.chapter.title}</span>
                    <span className="chapter-row-meta">in {c.book.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {books && books.length > 0 && (
            <div>
              <h2 className="mb-4" style={{ fontSize: 'var(--fs-xl)' }}>BOOKS</h2>
              <BookGrid books={books} />
            </div>
          )}
        </section>
      )}
    </div>
  );
}