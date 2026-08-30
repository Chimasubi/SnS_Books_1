import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyBookmarks, deleteBookmark } from '@/services/reader.service';
import { useAuth } from '@/context/AuthContext';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useToast } from '@/context/ToastContext';
import { CoverArt } from '@/components/CoverArt';
import { EmptyState, Skeleton, Button } from '@/components/ui';
import { IconBookmark, IconArrowRight, IconTrash } from '@/components/icons';
import { formatDate } from '@/lib/format';

export function Bookmarks() {
  usePageMeta({ title: 'Bookmarks', noindex: true });
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<Awaited<ReturnType<typeof getMyBookmarks>> | null>(null);

  const load = async () => {
    if (!user) return;
    setItems(await getMyBookmarks(user.id));
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const remove = async (id: string) => {
    if (!user) return;
    deleteBookmark(user.id, id);
    toast('Bookmark removed.', 'info');
    await load();
  };

  if (!user) return null;
  if (!items) return <Skeleton style={{ height: 240 }} />;

  return (
    <div className="container">
      <section className="section" style={{ paddingTop: 'var(--space-7)' }}>
        <p className="eyebrow">Saved passages</p>
        <h1 className="page-title mt-2">BOOKMARKS</h1>
      </section>

      {items.length === 0 ? (
        <EmptyState
          icon={<IconBookmark size={24} />}
          title="No bookmarks yet."
          body="Start reading and save passages you want to return to — they'll wait for you here."
          action={<Link to="/books" className="btn btn-primary">Explore Books</Link>}
        />
      ) : (
        <div className="library-list">
          {items.map((item) => (
            <div key={item.id} className="library-entry">
              {item.book ? (
                <Link to={`/books/${item.book.slug}`} aria-label={item.book.title}>
                  <CoverArt book={item.book} />
                </Link>
              ) : (
                <div className="mini-cover" />
              )}
              <div className="library-entry-body">
                <span className="library-entry-order">Bookmark</span>
                <h3 className="library-entry-title">
                  {item.note ? `“${item.note}”` : 'Saved passage'}
                </h3>
                <p className="library-entry-author">{item.book?.title ?? 'Book'}</p>
                <div className="library-entry-meta">
                  <span>{item.chapterTitle}</span>
                  <span>Saved {formatDate(item.createdAt)}</span>
                </div>
                <div className="library-entry-actions">
                  {item.book && (
                    <Link to={`/read/${item.bookId}`} className="btn btn-outline btn-sm">
                      Open book <IconArrowRight size={13} />
                    </Link>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => remove(item.id)} icon={<IconTrash size={14} />}>
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}