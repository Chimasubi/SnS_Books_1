import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchCatalog } from '@/services/books.service';
import { Button, LoadingState, EmptyState } from '@/components/ui';
import { IconSearch, IconBook, IconClock, IconArrowRight, IconX } from '@/components/icons';

const RECENT_KEY = 'sns.books.recentSearches';
const POPULAR = ['first fire', 'Africa', 'essays', 'music'];

export function SearchOverlay({ onClose, onSearch }: { onClose: () => void; onSearch: (q: string) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Awaited<ReturnType<typeof searchCatalog>> | null>(null);
  const [recent, setRecent] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]') as string[];
    } catch {
      return [];
    }
  });
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const debounced = useMemo(() => query.trim(), [query]);

  useEffect(() => {
    if (!debounced) {
      setResults(null);
      setSearching(false);
      return;
    }
    let cancelled = false;
    setSearching(true);
    const t = window.setTimeout(async () => {
      const res = await searchCatalog(debounced);
      if (!cancelled) {
        setResults(res);
        setSearching(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [debounced]);

  const addRecent = (term: string) => {
    const next = [term, ...recent.filter((r) => r !== term)].slice(0, 6);
    setRecent(next);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const submit = (term: string) => {
    if (!term.trim()) return;
    addRecent(term);
    onSearch(term);
  };

  const openBook = (slug: string) => {
    onClose();
    navigate(`/books/${slug}`);
  };

  const total = (results?.books.length ?? 0) + (results?.chapters.length ?? 0);

  return (
    <div className="search-overlay" role="dialog" aria-modal="true" aria-label="Search books, authors, topics">
      <div className="search-backdrop" onClick={onClose} />
      <div className="search-panel">
        <div className="search-input-row">
          <IconSearch size={22} className="search-input-icon" />
          <input
            ref={inputRef}
            className="search-input"
            placeholder="SEARCH BOOKS, AUTHORS, TOPICS..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit(query)}
            aria-label="Search"
          />
          <button className="icon-btn" onClick={onClose} aria-label="Close search">
            <IconX size={20} />
          </button>
        </div>

        <div className="search-body">
          {!query.trim() && (
            <div className="search-suggest">
              <div className="search-suggest-col">
                <h4 className="search-suggest-title">RECENT</h4>
                {recent.length === 0 ? (
                  <p className="muted">No recent searches yet.</p>
                ) : (
                  recent.map((r) => (
                    <button key={r} className="search-chip" onClick={() => submit(r)}>
                      <IconClock size={14} /> {r}
                    </button>
                  ))
                )}
              </div>
              <div className="search-suggest-col">
                <h4 className="search-suggest-title">POPULAR</h4>
                {POPULAR.map((p) => (
                  <button key={p} className="search-chip" onClick={() => submit(p)}>
                    <IconSearch size={14} /> {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {query.trim() && searching && <LoadingState label="Searching…" />}

          {query.trim() && !searching && results && total === 0 && (
            <EmptyState
              title="No results found"
              body={`Nothing matched "${query}". Try a different book, author or topic.`}
            />
          )}

          {query.trim() && !searching && results && total > 0 && (
            <div className="stack-sm">
              <p className="search-meta">{total} result{total === 1 ? '' : 's'} for “{query}”</p>
              {results.books.map((book) => (
                <button key={book.id} className="search-result" onClick={() => openBook(book.slug)}>
                  <span className="search-result-icon"><IconBook size={18} /></span>
                  <span className="search-result-text">
                    <span className="search-result-title">{book.title}</span>
                    <span className="search-result-sub">
                      {book.eduNumber} · {book.author?.name ?? 'SNS Books'}
                    </span>
                  </span>
                  <IconArrowRight size={16} className="search-result-arrow" />
                </button>
              ))}
              {results.chapters.map((c) => (
                <button
                  key={c.chapter.id}
                  className="search-result"
                  onClick={() => openBook(c.book.slug)}
                >
                  <span className="search-result-icon"><IconBook size={18} /></span>
                  <span className="search-result-text">
                    <span className="search-result-title">{c.chapter.title}</span>
                    <span className="search-result-sub">Chapter in {c.book.title}</span>
                  </span>
                  <IconArrowRight size={16} className="search-result-arrow" />
                </button>
              ))}
              <div className="mt-2">
                <Button
                  variant="ghost"
                  onClick={() => submit(query)}
                  icon={<IconSearch size={16} />}
                >
                  See all results
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}