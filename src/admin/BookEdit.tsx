import { useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { Book, CurrencyCode } from '@/types';
import { db, uid, getSettings } from '@/lib/store';
import { useToast } from '@/context/ToastContext';
import { Button, EmptyState } from '@/components/ui';
import { CoverArt } from '@/components/CoverArt';
import { IconUpload, IconArrowLeft, IconTrash } from '@/components/icons';

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const PALETTES = ['ember', 'dawn', 'river', 'choir', 'continent'];

export function AdminBookEdit() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id;
  const navigate = useNavigate();
  const { toast } = useToast();

  const existing = useMemo(() => (id ? db.read<Book>('books').find((b) => b.id === id) : null), [id]);

  const [form, setForm] = useState({
    title: existing?.title ?? '',
    eduNumber: existing?.eduNumber ?? 'BOOK 01',
    subtitle: existing?.subtitle ?? '',
    category: existing?.category ?? 'Fiction',
    description: existing?.description ?? '',
    about: existing?.about ?? '',
    whatsInside: (existing?.whatsInside ?? []).join('\n'),
    price: String(existing?.price.amount ?? 15000),
    currency: (existing?.price.currency ?? 'TZS') as CurrencyCode,
    status: existing?.status ?? 'published',
    featured: existing?.featured ?? false,
    sampleCount: existing?.sampleCount ?? 1,
    palette: existing?.palette ?? 'ember',
  });
  const [pdfName, setPdfName] = useState<string | null>(null);
  const [coverName, setCoverName] = useState<string | null>(null);

  const update = (key: string, value: string | number | boolean) => setForm((f) => ({ ...f, [key]: value }));

  const previewBook = useMemo<Book>(
    () => ({
      id: existing?.id ?? 'preview',
      title: form.title || 'Untitled Book',
      slug: toSlug(form.title),
      subtitle: form.subtitle,
      eduNumber: form.eduNumber,
      authorId: existing?.authorId ?? 'author-frederick',
      description: form.description,
      about: form.about,
      whatsInside: form.whatsInside.split('\n').filter(Boolean),
      category: form.category,
      cover: existing?.cover ?? null,
      palette: form.palette,
      price: { amount: Number(form.price) || 0, currency: form.currency },
      status: form.status as Book['status'],
      featured: form.featured,
      sampleCount: Number(form.sampleCount) || 0,
      publishedAt: existing?.publishedAt ?? null,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      demo: existing?.demo ?? true,
    }),
    [form, existing],
  );

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();
    if (isNew) {
      const book: Book = {
        ...previewBook,
        id: uid('book'),
        publishedAt: form.status === 'published' ? now : null,
        createdAt: now,
        updatedAt: now,
        cover: existing?.cover ?? null,
      };
      db.insert<Book>('books', book);
      toast(`Book "${book.title}" created.`, 'success');
      navigate(`/admin/books/${book.id}`);
    } else if (existing) {
      const updated: Book = {
        ...existing,
        title: previewBook.title,
        slug: existing.slug || toSlug(previewBook.title),
        subtitle: previewBook.subtitle,
        description: previewBook.description,
        about: previewBook.about,
        whatsInside: previewBook.whatsInside,
        category: previewBook.category,
        eduNumber: previewBook.eduNumber,
        price: previewBook.price,
        status: previewBook.status,
        featured: previewBook.featured,
        sampleCount: previewBook.sampleCount,
        palette: previewBook.palette,
        publishedAt: form.status === 'published' ? existing.publishedAt ?? now : null,
        updatedAt: now,
      };
      db.upsert<Book>('books', updated);
      toast('Book updated.', 'success');
      navigate(`/admin/books/${updated.id}`);
    }
  };

  const remove = () => {
    if (!existing || !window.confirm(`Delete "${existing.title}"? This cannot be undone.`)) return;
    db.removeId<Book>('books', existing.id);
    toast('Book deleted.', 'info');
    navigate('/admin/books');
  };

  const statuses: Book['status'][] = ['draft', 'published', 'coming_soon'];

  if (!existing && !isNew) {
    return <EmptyState title="Book not found" body="This book does not exist." action={<Link to="/admin/books" className="btn btn-primary">All books</Link>} />;
  }

  return (
    <div className="stack">
      <div>
        <Link to="/admin/books" className="btn btn-ghost btn-sm"><IconArrowLeft size={14} /> Back to books</Link>
        <h1 style={{ fontSize: 'var(--fs-2xl)', marginTop: 'var(--space-3)' }}>
          {isNew ? 'NEW BOOK' : `EDIT BOOK · ${existing?.title}`}
        </h1>
      </div>

      <form onSubmit={submit} className="admin-grid admin-grid-2">
        <div className="panel panel-pad stack">
          <div className="field">
            <label className="field-label" htmlFor="b-title">Title</label>
            <input id="b-title" className="input" required value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="Book title" />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="b-no">Book number / edition</label>
            <input id="b-no" className="input" value={form.eduNumber} onChange={(e) => update('eduNumber', e.target.value)} placeholder="BOOK 01" />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="b-sub">Subtitle</label>
            <input id="b-sub" className="input" value={form.subtitle} onChange={(e) => update('subtitle', e.target.value)} placeholder="A novel of beginnings" />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="b-cat">Category</label>
            <select id="b-cat" className="select" value={form.category} onChange={(e) => update('category', e.target.value)}>
              {['Fiction', 'Non-fiction', 'Essays', 'Memoir', 'Poetry'].map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="field-label" htmlFor="b-desc">Short description</label>
            <textarea id="b-desc" className="textarea" value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="One or two sentences for cards and listings." />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="b-about">About the book</label>
            <textarea id="b-about" className="textarea" style={{ minHeight: 140 }} value={form.about} onChange={(e) => update('about', e.target.value)} placeholder="Write about the book. Separate paragraphs with a blank line." />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="b-inside">What you'll discover (one per line)</label>
            <textarea id="b-inside" className="textarea" value={form.whatsInside} onChange={(e) => update('whatsInside', e.target.value)} placeholder={'Free sample chapter\nSynchronised progress\nBookmarks'} />
          </div>

          <div className="row flex-wrap" style={{ gap: 'var(--space-4)' }}>
            <div className="field">
              <label className="field-label" htmlFor="b-price">Price</label>
              <input id="b-price" className="input" type="number" min={0} value={form.price} onChange={(e) => update('price', e.target.value)} />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="b-curr">Currency</label>
              <select id="b-curr" className="select" value={form.currency} onChange={(e) => update('currency', e.target.value)}>
                {getSettings().currenciesEnabled.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="field-label" htmlFor="b-sample">Sample chapters</label>
              <input id="b-sample" className="input" type="number" min={0} value={form.sampleCount} onChange={(e) => update('sampleCount', Number(e.target.value))} />
            </div>
          </div>

          <div className="field">
            <label className="field-label" htmlFor="b-status">Status</label>
            <select id="b-status" className="select" value={form.status} onChange={(e) => update('status', e.target.value)}>
              {statuses.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>

          <label className="checkbox-row">
            <input type="checkbox" checked={form.featured} onChange={(e) => update('featured', e.target.checked)} />
            Feature this book on the homepage
          </label>

          <div className="row flex-wrap" style={{ justifyContent: 'space-between', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--sns-border)' }}>
            <div className="row">
              <Button type="submit">{isNew ? 'Create Book' : 'Save Changes'}</Button>
              <Link to="/admin/books" className="btn btn-ghost">Cancel</Link>
            </div>
            {!isNew && (
              <Button type="button" variant="danger" onClick={remove} icon={<IconTrash size={15} />}>Delete</Button>
            )}
          </div>
        </div>

        <div className="stack">
          <div className="panel panel-pad">
            <h2 className="mb-4" style={{ fontSize: 'var(--fs-md)' }}>BOOK COVER</h2>
            <div style={{ maxWidth: 200, marginInline: 'auto' }}>
              <CoverArt book={previewBook} />
            </div>
            <div className="field mt-4">
              <label className="field-label" htmlFor="b-palette">Cover style</label>
              <select id="b-palette" className="select" value={form.palette} onChange={(e) => update('palette', e.target.value)}>
                {PALETTES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="mt-4">
              <label className="field-label mb-2" htmlFor="b-cover">Upload cover image (JPG/PNG)</label>
              <input
                id="b-cover"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => setCoverName(e.target.files?.[0]?.name ?? null)}
              />
              {coverName && <p className="form-note mt-2"><IconUpload size={13} /> {coverName} selected</p>}
              {!coverName && <p className="form-note mt-2">Placeholder covers are generated until a real image is uploaded. In production the upload goes to secure storage and the public URL is stored here.</p>}
            </div>
          </div>

          <div className="panel panel-pad">
            <h2 className="mb-2" style={{ fontSize: 'var(--fs-md)' }}>PDF ASSET (OPTIONAL)</h2>
            <p className="muted" style={{ fontSize: 'var(--fs-sm)', lineHeight: 'var(--lh-normal)' }}>
              Structured chapters are the primary reading format. A PDF may be attached as an
              archival/download asset where the author permits it. Private files are never
              exposed through public static URLs.
            </p>
            <div className="mt-3">
              <input type="file" accept="application/pdf" onChange={(e) => setPdfName(e.target.files?.[0]?.name ?? null)} aria-label="Upload PDF asset" />
              {pdfName && <p className="form-note mt-2"><IconUpload size={13} /> {pdfName}</p>}
            </div>
          </div>

          {!isNew && (
            <div className="panel panel-pad">
              <h2 className="mb-2" style={{ fontSize: 'var(--fs-md)' }}>CHAPTERS</h2>
              <p className="form-note">Manage the structured chapters for this book.</p>
              <div className="mt-3 row">
                <Link to={`/admin/books/${existing?.id}/chapters`} className="btn btn-outline btn-sm">Open chapter manager</Link>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}