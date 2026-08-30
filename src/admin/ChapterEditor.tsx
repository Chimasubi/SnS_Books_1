import { useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { Book, Chapter, ChapterBlock } from '@/types';
import { db, uid } from '@/lib/store';
import { useToast } from '@/context/ToastContext';
import { Button, EmptyState } from '@/components/ui';
import { IconArrowLeft, IconTrash, IconSettings } from '@/components/icons';
import { parseBlocks, renderBlocks } from '@/services/reader.service';

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function AdminChapterEditor() {
  const { id: bookId, chapterId } = useParams<{ id: string; chapterId?: string }>();
  const isNew = !chapterId;
  const navigate = useNavigate();
  const { toast } = useToast();

  const book = useMemo(() => db.read<Book>('books').find((b) => b.id === bookId), [bookId]);
  const existing = useMemo(
    () => (chapterId ? db.read<Chapter>('chapters').find((c) => c.id === chapterId) : null),
    [chapterId],
  );
  const allChapters = useMemo(
    () => db.read<Chapter>('chapters').filter((c) => c.bookId === bookId).sort((a, b) => a.order - b.order),
    [bookId],
  );

  const [title, setTitle] = useState(existing?.title ?? '');
  const [raw, setRaw] = useState(existing ? renderBlocks(existing.content) : '');
  const [published, setPublished] = useState(existing?.published ?? true);

  const preview = useMemo(() => parseBlocks(raw), [raw]);

  const save = (e: FormEvent) => {
    e.preventDefault();
    if (!book) return;
    const now = new Date().toISOString();
    const blocks = parseBlocks(raw);
    if (isNew) {
      const chapter: Chapter = {
        id: uid('ch'),
        bookId: book.id,
        title: title.trim() || 'Untitled chapter',
        slug: toSlug(title) || `chapter-${allChapters.length + 1}`,
        order: allChapters.length,
        content: blocks,
        published,
        createdAt: now,
        updatedAt: now,
      };
      db.insert<Chapter>('chapters', chapter);
      toast('Chapter created.', 'success');
      navigate(`/admin/books/${bookId}/chapters`);
    } else if (existing) {
      db.upsert<Chapter>('chapters', {
        ...existing,
        title: title.trim() || existing.title,
        content: blocks,
        published,
        updatedAt: now,
      });
      toast('Chapter saved.', 'success');
      navigate(`/admin/books/${bookId}/chapters`);
    }
  };

  const remove = () => {
    if (!existing || !window.confirm(`Delete chapter "${existing.title}"?`)) return;
    db.removeId<Chapter>('chapters', existing.id);
    const reindexed = allChapters.filter((c) => c.id !== existing.id).map((c, i) => ({ ...c, order: i }));
    db.write<Chapter>('chapters', reindexed);
    toast('Chapter deleted.', 'info');
    navigate(`/admin/books/${bookId}/chapters`);
  };

  if (!book) {
    return <EmptyState title="Book not found" body="Select a book to edit its chapters." action={<Link to="/admin/books" className="btn btn-primary">All books</Link>} />;
  }

  const sampleHint =
    !isNew && existing && existing.order < book.sampleCount
      ? 'This chapter is part of the free sample shown to all readers.'
      : undefined;

  return (
    <div className="stack">
      <div>
        <Link to={`/admin/books/${book.id}/chapters`} className="btn btn-ghost btn-sm">
          <IconArrowLeft size={14} /> Back to chapters
        </Link>
        <h1 style={{ fontSize: 'var(--fs-2xl)', marginTop: 'var(--space-3)' }}>
          {isNew ? 'NEW CHAPTER' : `EDIT CHAPTER · ${existing?.title}`}
        </h1>
        <p className="muted">{book.title} {sampleHint ? '· ' + sampleHint : ''}</p>
      </div>

      <form onSubmit={save} className="admin-grid admin-grid-2">
        <div className="panel panel-pad stack">
          <div className="field">
            <label className="field-label" htmlFor="ch-title">Chapter title</label>
            <input id="ch-title" className="input" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Chapter title" />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="ch-content">Content</label>
            <p className="field-help">
              Structured editor — headings start with <code>## </code>, quotes with{' '}
              <code>### </code>, paragraphs are plain text. Blank lines separate blocks.
              Paragraphs are used by default.
            </p>
            <textarea
              id="ch-content"
              className="textarea"
              style={{ minHeight: 320, fontFamily: 'var(--font-serif)' }}
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              placeholder={'## Chapter Heading\n\nBegin writing…'}
            />
          </div>

          <label className="checkbox-row">
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
            Published (visible to readers)
          </label>

          <div className="row flex-wrap" style={{ justifyContent: 'space-between', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--sns-border)' }}>
            <div className="row">
              <Button type="submit">{isNew ? 'Create Chapter' : 'Save Chapter'}</Button>
              <Link to={`/admin/books/${book.id}/chapters`} className="btn btn-ghost">Cancel</Link>
            </div>
            {!isNew && (
              <Button type="button" variant="danger" onClick={remove} icon={<IconTrash size={15} />}>Delete</Button>
            )}
          </div>
        </div>

        <div className="panel">
          <div className="admin-panel-head">
            <h2>PREVIEW</h2>
            <IconSettings size={16} className="muted" />
          </div>
          <div className="admin-panel-body">
            <p className="reader-chapter-label">Chapter {existing ? String(existing.order + 1).padStart(2, '0') : '·'}</p>
            <h2 className="reader-chapter-title" style={{ fontSize: 'var(--fs-2xl)' }}>
              {title || 'Untitled chapter'}
            </h2>
            <div className="block-preview">
              {preview.length === 0 ? (
                <p className="muted">The preview updates as you type.</p>
              ) : (
                preview.map((block: ChapterBlock, i: number) =>
                  block.type === 'heading' ? (
                    <h4 key={i} style={{ margin: '0 0 12px', fontSize: 'var(--fs-lg)' }}>{block.text}</h4>
                  ) : block.type === 'quote' ? (
                    <blockquote key={i} style={{ margin: '0 0 12px', borderLeft: '3px solid var(--sns-orange)', paddingLeft: 'var(--space-4)', fontStyle: 'italic' }}>
                      {block.text}
                    </blockquote>
                  ) : (
                    <p key={i}>{block.text}</p>
                  ),
                )
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}