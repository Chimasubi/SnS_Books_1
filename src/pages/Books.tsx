import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { BookStatus, BookWithAuthor } from '@/types';
import { listBooks } from '@/services/books.service';
import { usePageMeta } from '@/hooks/usePageMeta';
import { BookGrid } from '@/components/BookCard';
import { SkeletonBookGrid, EmptyState, Button } from '@/components/ui';

type Filter = 'all' | 'published' | 'coming_soon';
type Sort = 'collection' | 'price-asc' | 'price-desc' | 'title';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'published', label: 'Available' },
  { id: 'coming_soon', label: 'Coming Soon' },
];

export function Books() {
  usePageMeta({
    title: 'All Books',
    description: 'Browse the complete SNS Books collection.',
  });
  const [params, setParams] = useSearchParams();
  const [books, setBooks] = useState<BookWithAuthor[] | null>(null);

  const filterParam = params.get('status') === 'coming_soon' ? 'coming_soon' : params.get('featured') ? 'published' : 'all';
  const [filter, setFilter] = useState<Filter>(filterParam);
  const [sort, setSort] = useState<Sort>('collection');

  useEffect(() => {
    listBooks().then(setBooks);
  }, []);

  useEffect(() => {
    if (params.get('status') === 'coming_soon') setFilter('coming_soon');
    else if (params.get('featured')) setFilter('published');
  }, [params]);

  const visible = useMemo(() => {
    if (!books) return null;
    let list = books;
    if (filter === 'published') list = list.filter((b) => b.status === 'published');
    if (filter === 'coming_soon') list = list.filter((b) => (b.status as BookStatus) === 'coming_soon');
    switch (sort) {
      case 'price-asc':
        return [...list].sort((a, b) => a.price.amount - b.price.amount);
      case 'price-desc':
        return [...list].sort((a, b) => b.price.amount - a.price.amount);
      case 'title':
        return [...list].sort((a, b) => a.title.localeCompare(b.title));
      default:
        return list;
    }
  }, [books, filter, sort]);

  const setFilterAndParams = (f: Filter) => {
    setFilter(f);
    const next = new URLSearchParams(params);
    if (f === 'coming_soon') next.set('status', 'coming_soon');
    else if (f === 'published') next.set('status', 'published');
    else next.delete('status');
    next.delete('featured');
    setParams(next, { replace: true });
  };

  return (
    <div className="container">
      <section className="section" style={{ paddingTop: 'var(--space-7)' }}>
        <p className="eyebrow">The Collection</p>
        <h1 className="page-title mt-2">BOOKS</h1>
        <p className="page-sub">
          Five books. One remarkable journey. Explore the launch collection of
          Fredrick Bundala, published by SNS Books.
        </p>
      </section>

      <div className="toolbar">
        <div className="toolbar-filters" role="group" aria-label="Filter books">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              className={`filter-btn ${filter === f.id ? 'filter-btn-active' : ''}`}
              onClick={() => setFilterAndParams(f.id)}
              aria-pressed={filter === f.id}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="toolbar-sort">
          <label htmlFor="sort">Sort</label>
          <select
            id="sort"
            className="select"
            style={{ minWidth: 180 }}
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
          >
            <option value="collection">Collection order</option>
            <option value="title">Title A–Z</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </div>
      </div>

      {!visible ? (
        <SkeletonBookGrid />
      ) : visible.length === 0 ? (
        <EmptyState
          title="Nothing here yet"
          body="No books match this filter right now. Try another view."
          action={
            <Button onClick={() => setFilterAndParams('all')}>Show all books</Button>
          }
        />
      ) : (
        <BookGrid books={visible} />
      )}
    </div>
  );
}