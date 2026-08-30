import { useMemo, useState, type FormEvent } from 'react';
import type { Author } from '@/types';
import { db } from '@/lib/store';
import { useToast } from '@/context/ToastContext';
import { Button, EmptyState } from '@/components/ui';
import { IconEdit } from '@/components/icons';

export function AdminAuthors() {
  const { toast } = useToast();
  const authors = useMemo(
    () =>
      [...db.read<Author>('authors')].sort((a, b) => a.name.localeCompare(b.name)),
    [],
  );

  const [editingId, setEditingId] = useState<string | null>(authors[0]?.id ?? null);
  const author = authors.find((a) => a.id === editingId) ?? null;

  const [form, setForm] = useState({
    name: author?.name ?? '',
    tagline: author?.tagline ?? '',
    badge: author?.badge ?? '',
    country: author?.country ?? '',
    bio: author ? author.bio.join('\n\n') : '',
    quote: author?.quote ?? '',
  });

  const select = (id: string) => {
    setEditingId(id);
    const a = authors.find((x) => x.id === id);
    if (a) {
      setForm({
        name: a.name,
        tagline: a.tagline,
        badge: a.badge ?? '',
        country: a.country,
        bio: a.bio.join('\n\n'),
        quote: a.quote ?? '',
      });
    }
  };

  const save = (e: FormEvent) => {
    e.preventDefault();
    if (!author) return;
    db.upsert<Author>('authors', {
      ...author,
      name: form.name.trim() || author.name,
      tagline: form.tagline,
      badge: form.badge || undefined,
      country: form.country,
      bio: form.bio.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean),
      quote: form.quote || undefined,
    });
    toast('Author profile updated.', 'success');
  };

  return (
    <div className="stack">
      {authors.length === 0 ? (
        <EmptyState
          icon={<IconEdit size={24} />}
          title="No authors yet"
          body="Add author profiles to associate them with books."
        />
      ) : (
        <div className="admin-grid admin-grid-2">
          <div className="stack-sm">
            {authors.map((a) => (
              <button
                key={a.id}
                type="button"
                className={`chapter-editor-row ${a.id === editingId ? 'row-selected' : ''}`}
                onClick={() => select(a.id)}
                style={{ textAlign: 'left', cursor: 'pointer' }}
              >
                <div style={{ flex: 1 }}>
                  <strong>{a.name}</strong>
                  <p className="muted" style={{ fontSize: 'var(--fs-xs)' }}>{a.tagline}</p>
                </div>
                <IconEdit size={15} className="muted" />
              </button>
            ))}
          </div>

          <form onSubmit={save} className="panel panel-pad stack">
            <h2 className="mb-2" style={{ fontSize: 'var(--fs-lg)' }}>AUTHOR PROFILE</h2>
            {author && <p className="muted" style={{ fontSize: 'var(--fs-xs)' }}>Editing: {author.id}</p>}

            <div className="field">
              <label className="field-label" htmlFor="a-name">Full name</label>
              <input id="a-name" className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="a-tagline">Tagline</label>
              <input id="a-tagline" className="input" value={form.tagline} onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))} />
            </div>
            <div className="row" style={{ gap: 'var(--space-3)' }}>
              <div className="field" style={{ flex: 1 }}>
                <label className="field-label" htmlFor="a-badge">Badge</label>
                <input id="a-badge" className="input" value={form.badge} onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))} />
              </div>
              <div className="field" style={{ flex: 1 }}>
                <label className="field-label" htmlFor="a-country">Country</label>
                <input id="a-country" className="input" value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} />
              </div>
            </div>
            <div className="field">
              <label className="field-label" htmlFor="a-quote">Quote</label>
              <input id="a-quote" className="input" value={form.quote} onChange={(e) => setForm((f) => ({ ...f, quote: e.target.value }))} />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="a-bio">Biography (blank line between paragraphs)</label>
              <textarea id="a-bio" className="textarea" style={{ minHeight: 160 }} value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} />
            </div>
            <div className="row">
              <Button type="submit">Save Profile</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}