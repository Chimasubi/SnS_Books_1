import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getReadingHistory } from '@/services/library.service';
import { useAuth } from '@/context/AuthContext';
import { usePageMeta } from '@/hooks/usePageMeta';
import { ProgressBar, EmptyState, Skeleton } from '@/components/ui';
import { IconClock, IconArrowRight } from '@/components/icons';
import { timeAgo } from '@/lib/format';

export function History() {
  usePageMeta({ title: 'Reading History', noindex: true });
  const { user } = useAuth();
  const [history, setHistory] = useState<Awaited<ReturnType<typeof getReadingHistory>> | null>(null);

  useEffect(() => {
    if (!user) return;
    setHistory(null);
    getReadingHistory(user.id).then(setHistory);
  }, [user]);

  if (!user) return null;

  return (
    <div className="container">
      <section className="section" style={{ paddingTop: 'var(--space-7)' }}>
        <p className="eyebrow">Recent reading</p>
        <h1 className="page-title mt-2">READING HISTORY</h1>
      </section>

      {!history ? (
        <div className="stack-sm">
          <Skeleton style={{ height: 84 }} />
          <Skeleton style={{ height: 84 }} />
        </div>
      ) : history.length === 0 ? (
        <EmptyState
          icon={<IconClock size={24} />}
          title="No reading history yet"
          body="Books you read appear here with your place and progress saved automatically."
          action={<Link to="/books" className="btn btn-primary">Explore Books</Link>}
        />
      ) : (
        <div className="stack-sm">
          {history.map((h) => (
            <div key={h.bookId} className="history-row">
              <div className="history-row-meta">
                <p className="history-row-title">{h.bookTitle} · {h.authorName}</p>
                <p className="history-row-sub">
                  <span>{h.chapterTitle}</span>
                  <span>{Math.round(h.percentage)}% complete</span>
                  <span>Last read {timeAgo(h.lastReadAt)}</span>
                </p>
              </div>
              <div style={{ width: 140 }}>
                <ProgressBar value={h.percentage} />
              </div>
              <Link to={`/read/${h.bookId}`} className="btn btn-outline btn-sm">
                Resume <IconArrowRight size={13} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}