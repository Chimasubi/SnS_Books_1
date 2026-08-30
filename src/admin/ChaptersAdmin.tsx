import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Book, Chapter } from '@/types';
import { db } from '@/lib/store';
import { EmptyState } from '@/components/ui';
import { IconPlus, IconEdit, IconText, IconArrowLeft, IconChevronUp, IconChevronDown } from '@/components/icons';

export function AdminChapters() {
  const { id } = useParams<{ id: string }>();
  const book = useMemo(() => (id ? db.read<Book>('books').find((b) => b.id === id) : null), [id]);
  const chapters = useMemo(
    () => db.read<Chapter>('chapters').filter((c) => c.bookId === id).sort((a, b) => a.order - b.order),
    [id],
  );

  const reorder = (chapterId: string, dir: -1 | 1) => {
    const list = [...chapters];
    const idx = list.findIndex((c) => c.id === chapterId);
    const target = idx + dir;
    if (idx < 0 || target < 0 || target >= list.length) return;
    const [item] = list.splice(idx, 1);
    list.splice(target, 0, item);
    const next = list.map((c, i) => ({ ...c, order: i }));
    db.write<Chapter>('chapters', next);
    window.location.reload();
  };

  const togglePublish = (chapter: Chapter) => {
    db.upsert<Chapter>('chapters', { ...chapter, published: !chapter.published });
    window.location.reload();
  };

  if (!book) {
    return <EmptyState title="Book not found" body="Select a book from the books page." action={<Link to="/admin/books" className="btn btn-primary">All books</Link>} />;
  }

  return (
    <div className="stack">
      <div className="row-between flex-wrap">
        <div>
          <Link to={`/admin/books/${book.id}`} className="btn btn-ghost btn-sm"><IconArrowLeft size={14} /> Back to book</Link>
          <h1 style={{ fontSize: 'var(--fs-2xl)', marginTop: 'var(--space-3)' }}>CHAPTERS · {book.title}</h1>
          <p className="muted">{chapters.length} chapters · first {book.sampleCount} are configured as the free sample</p>
        </div>
        <Link to={`/admin/books/${book.id}/chapters/new`} className="btn btn-primary btn-sm">
          <IconPlus size={14} /> New Chapter
        </Link>
      </div>

      {chapters.length === 0 ? (
        <EmptyState
          icon={<IconText size={24} />}
          title="No chapters yet"
          body="Chapters power the web reader. Create your first chapter."
          action={<Link to={`/admin/books/${book.id}/chapters/new`} className="btn btn-primary">New Chapter</Link>}
        />
      ) : (
        <div className="chapter-editor-list">
          {chapters.map((ch) => (
            <div key={ch.id} className="chapter-editor-row">
              <span className="chapter-row-num">{String(ch.order + 1).padStart(2, '0')}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong>{ch.title}</strong>
                <p className="muted" style={{ fontSize: 'var(--fs-xs)' }}>
                  {ch.order < book.sampleCount ? 'Free sample · ' : ''}
                  {ch.published ? 'Published' : 'Draft'}
                </p>
              </div>
              <button className="icon-btn" onClick={() => reorder(ch.id, -1)} aria-label="Move up" title="Move up"><IconChevronUp size={16} /></button>
              <button className="icon-btn" onClick={() => reorder(ch.id, 1)} aria-label="Move down" title="Move down"><IconChevronDown size={16} /></button>
              <button className="btn btn-ghost btn-sm" onClick={() => togglePublish(ch)}>
                {ch.published ? 'Unpublish' : 'Publish'}
              </button>
              <Link to={`/admin/books/${book.id}/chapters/${ch.id}`} className="btn btn-outline btn-sm">
                <IconEdit size={13} /> Edit
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}