import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { db } from '@/lib/store';
import type { Book, Chapter } from '@/types';
import { CoverArt } from '@/components/CoverArt';
import { EmptyState } from '@/components/ui';
import { IconEdit, IconPlus, IconText, IconBook } from '@/components/icons';
import { formatMoney } from '@/lib/format';

export function AdminBooks() {
  const books = useMemo(() => db.read<Book>('books').sort((a, b) => a.eduNumber.localeCompare(b.eduNumber)), []);
  const chapterCount = useMemo(() => {
    const map = new Map<string, number>();
    db.read<Chapter>('chapters').forEach((c) => map.set(c.bookId, (map.get(c.bookId) ?? 0) + 1));
    return map;
  }, []);

  return (
    <div className="stack">
      <div className="row-between">
        <p className="muted">{books.length} books in catalogue</p>
        <Link to="/admin/books/new" className="btn btn-primary btn-sm">
          <IconPlus size={14} /> New Book
        </Link>
      </div>

      {books.length === 0 ? (
        <EmptyState
          icon={<IconBook size={24} />}
          title="No books yet"
          body="Create your first book to start building the catalogue."
          action={<Link to="/admin/books/new" className="btn btn-primary">New Book</Link>}
        />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Cover</th>
                <th>Book</th>
                <th>Price</th>
                <th>Chapters</th>
                <th>Status</th>
                <th>Featured</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {books.map((b) => (
                <tr key={b.id}>
                  <td><div className="mini-cover"><CoverArt book={b} /></div></td>
                  <td>
                    <strong>{b.title}</strong>
                    <p className="muted" style={{ fontSize: 'var(--fs-xs)' }}>{b.eduNumber} · {b.category}{b.demo ? ' · Demo' : ''}</p>
                  </td>
                  <td>{formatMoney(b.price.amount, b.price.currency)}</td>
                  <td>{chapterCount.get(b.id) ?? 0}</td>
                  <td>
                    <span className={`chip ${b.status === 'published' ? 'chip-success' : ''}`}>{b.status.replace('_', ' ')}</span>
                  </td>
                  <td>{b.featured ? '✓' : '—'}</td>
                  <td>
                    <div className="table-actions">
                      <Link to={`/admin/books/${b.id}`} className="btn btn-outline btn-sm">
                        <IconEdit size={13} /> Edit
                      </Link>
                      <Link to={`/admin/books/${b.id}/chapters`} className="btn btn-ghost btn-sm">
                        <IconText size={13} /> Chapters
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function AdminChaptersLink({ bookId }: { bookId: string }) {
  return (
    <Link to={`/admin/books/${bookId}/chapters`} className="btn btn-ghost btn-sm">
      <IconText size={13} /> Chapters
    </Link>
  );
}