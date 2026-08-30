import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import type { LibraryEntry } from '@/types';
import { getMyLibrary, getReadingHistory } from '@/services/library.service';
import { useAuth } from '@/context/AuthContext';
import { usePageMeta } from '@/hooks/usePageMeta';
import { CoverArt } from '@/components/CoverArt';
import { ProgressBar, EmptyState, Skeleton, Button } from '@/components/ui';
import {
  IconBookOpen,
  IconArrowRight,
  IconClock,
  IconLibrary,
} from '@/components/icons';
import { formatDate, timeAgo } from '@/lib/format';

function LibraryView() {
  usePageMeta({ title: 'My Library', noindex: true });
  const { user } = useAuth();
  const [entries, setEntries] = useState<LibraryEntry[] | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    setEntries(null);
    getMyLibrary(user.id).then(setEntries);
  }, [user]);

  const continueReading = useMemo(
    () => [...(entries ?? [])].sort((a, b) => ((b.progress?.percentage ?? 0) - (a.progress?.percentage ?? 0))).slice(0, 3),
    [entries],
  );

  if (!user) return null;

  return (
    <div>
      {entries === null ? (
        <div className="stack">
          <Skeleton style={{ height: 160 }} />
          <Skeleton style={{ height: 160 }} />
        </div>
      ) : entries.length === 0 ? (
        <EmptyState
          icon={<IconLibrary size={24} />}
          title="Your library is waiting for its first story."
          body="Once you purchase a book it appears here, ready to read on any device."
          action={<Link to="/books" className="btn btn-primary">Explore Books</Link>}
        />
      ) : (
        <div className="stack">
          {continueReading.length > 0 && (
            <div>
              <h2 className="mb-4" style={{ fontSize: 'var(--fs-xl)' }}>CONTINUE READING</h2>
              <div className="stack-sm">
                {continueReading.map((entry) => (
                  <div key={entry.entitlementId} className="library-entry">
                    <Link to={`/books/${entry.book.slug}`} aria-label={entry.book.title}>
                      <CoverArt book={entry.book} />
                    </Link>
                    <div className="library-entry-body">
                      <span className="library-entry-order">{entry.book.eduNumber}</span>
                      <h3 className="library-entry-title">{entry.book.title}</h3>
                      <p className="library-entry-author">{entry.book.author?.name}</p>
                      {entry.progress ? (
                        <div className="mt-2">
                          <div className="row-between mb-1">
                            <span className="muted" style={{ fontSize: 'var(--fs-xs)' }}>
                              Chapter — {' '}{Math.round(entry.progress.percentage)}% complete
                            </span>
                          </div>
                          <ProgressBar value={entry.progress.percentage} />
                        </div>
                      ) : (
                        <span className="chip chip-success mt-2">Not started</span>
                      )}
                      <div className="library-entry-actions">
                        <Button size="sm" onClick={() => navigate(`/read/${entry.book.id}`)} icon={<IconBookOpen size={14} />}>
                          {entry.progress ? 'Continue Reading' : 'Start Reading'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="mb-4" style={{ fontSize: 'var(--fs-xl)' }}>MY BOOKS</h2>
            <div className="library-list">
              {entries.map((entry) => (
                <div key={entry.entitlementId} className="library-entry">
                  <Link to={`/books/${entry.book.slug}`} aria-label={entry.book.title}>
                    <CoverArt book={entry.book} />
                  </Link>
                  <div className="library-entry-body">
                    <span className="library-entry-order">{entry.book.eduNumber}</span>
                    <h3 className="library-entry-title">{entry.book.title}</h3>
                    <p className="library-entry-author">{entry.book.author?.name}</p>
                    <div className="library-entry-meta">
                      <span>Added {formatDate(entry.grantedAt)}</span>
                      {entry.progress && (
                        <span>{Math.round(entry.progress.percentage)}% read · {timeAgo(entry.progress.lastReadAt)}</span>
                      )}
                    </div>
                    <div className="library-entry-actions">
                      <Button size="sm" variant="outline" onClick={() => navigate(`/read/${entry.book.id}`)}>
                        <IconBookOpen size={14} /> {entry.progress ? 'Resume' : 'Read'}
                      </Button>
                      <Link to={`/books/${entry.book.slug}`} className="btn btn-ghost btn-sm">
                        Details <IconArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LibraryHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState<Awaited<ReturnType<typeof getReadingHistory>> | null>(null);

  useEffect(() => {
    if (!user) return;
    getReadingHistory(user.id).then(setHistory);
  }, [user]);

  if (!user) return null;
  if (!history) return <Skeleton style={{ height: 160 }} />;

  if (history.length === 0) {
    return (
      <EmptyState
        icon={<IconClock size={24} />}
        title="No reading history yet"
        body="Books you read will appear here, with your place and progress saved."
        action={<Link to="/books" className="btn btn-primary">Explore Books</Link>}
      />
    );
  }

  return (
    <div className="stack-sm">
      {history.map((h) => (
        <div key={h.bookId} className="history-row">
          <div className="history-row-meta">
            <p className="history-row-title">{h.bookTitle}</p>
            <p className="history-row-sub">
              <span>{h.chapterTitle}</span>
              <span>{Math.round(h.percentage)}%</span>
              <span>{timeAgo(h.lastReadAt)}</span>
            </p>
          </div>
          <div style={{ width: 120 }}>
            <ProgressBar value={h.percentage} />
          </div>
          <Link to={`/read/${h.bookId}`} className="btn btn-outline btn-sm">Resume</Link>
        </div>
      ))}
    </div>
  );
}

function LibraryBookmarks() {
  const { user } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;
  return (
    <div>
      <p className="muted mb-4">
        Bookmarked passages live on the <Link to="/bookmarks" className="orange">Bookmarks page</Link>.
      </p>
      <Button variant="ghost" onClick={() => navigate('/bookmarks')}>
        Open Bookmarks <IconArrowRight size={15} />
      </Button>
    </div>
  );
}

const TABS = [
  { label: 'MY LIBRARY', to: '/library', end: true },
  { label: 'BOOKMARKS', to: '/library/bookmarks' },
  { label: 'READING HISTORY', to: '/library/history' },
];

export function Library() {
  usePageMeta({ title: 'My Library', noindex: true });
  return (
    <div className="container">
      <section className="section" style={{ paddingTop: 'var(--space-7)' }}>
        <p className="eyebrow">Your books</p>
        <h1 className="page-title mt-2">MY LIBRARY</h1>
      </section>

      <div className="library-tabs" role="tablist" aria-label="Library sections">
        {TABS.map((t) => (
          <NavLink key={t.to} to={t.to} end={t.end} className={({ isActive }) => `library-tab ${isActive ? 'library-tab-active' : ''}`}>
            {t.label}
          </NavLink>
        ))}
      </div>

      <Routes>
        <Route index element={<LibraryView />} />
        <Route path="bookmarks" element={<LibraryBookmarks />} />
        <Route path="history" element={<LibraryHistory />} />
      </Routes>
    </div>
  );
}

export { LibraryView, LibraryBookmarks };