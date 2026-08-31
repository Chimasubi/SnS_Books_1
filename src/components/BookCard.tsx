import { Link } from 'react-router-dom';
import type { BookWithAuthor } from '@/types';
import { CoverArt } from '@/components/CoverArt';
import { ProgressBar } from '@/components/ui';
import { Reveal } from '@/components/Reveal';
import { IconArrowRight, IconCheck } from '@/components/icons';
import { formatMoney } from '@/lib/format';

type Ownership = 'purchased' | 'sample' | 'none';

export function bookOwnership(book: BookWithAuthor, ownedBookIds: Set<string>): Ownership {
  if (ownedBookIds.has(book.id)) return 'purchased';
  if (book.sampleCount > 0) return 'sample';
  return 'none';
}

export function statusLabel(book: BookWithAuthor): { label: string; tone: string } {
  if (book.status === 'coming_soon') return { label: 'Coming Soon', tone: 'chip' };
  if (book.featured) return { label: 'Featured', tone: 'chip-highlight' };
  if (book.status === 'draft') return { label: 'Draft', tone: 'chip' };
  return { label: 'Available', tone: 'chip-success' };
}

export function BookCard({
  book,
  owned = false,
  progress,
}: {
  book: BookWithAuthor;
  owned?: boolean;
  progress?: number | null;
}) {
  const price = formatMoney(book.price.amount, book.price.currency);
  const status = statusLabel(book);
  const showDemo = book.demo && book.status !== 'draft';

  return (
    <article className="book-card">
      <Link to={`/books/${book.slug}`} className="book-card-cover-link" aria-label={`View ${book.title}`}>
        <CoverArt book={book} className="book-card-cover" />
        {showDemo && <span className="book-card-demo">DEMO EDITION</span>}
        {progress !== undefined && progress !== null && progress >= 0 && (
          <div className="book-card-progress">
            <div className="row-between mb-1">
              <span className="book-card-progress-label">{Math.round(progress)}% read</span>
              <span className="book-card-progress-label">Continue</span>
            </div>
            <ProgressBar value={progress} />
          </div>
        )}
      </Link>
      <div className="book-card-body">
        <div className="row-between">
          <span className="book-card-edition">{book.eduNumber}</span>
          <span className={`chip ${status.tone}`}>{status.label}</span>
        </div>
        <h3 className="book-card-title">
          <Link to={`/books/${book.slug}`}>{book.title}</Link>
        </h3>
        <p className="book-card-author">{book.author?.name ?? 'SNS Books'}</p>
        <p className="book-card-desc">{book.description.slice(0, 110)}{book.description.length > 110 ? '…' : ''}</p>
        <div className="row-between book-card-foot">
          <span className="book-card-price">{price}</span>
          {owned ? (
            <Link to={`/read/${book.id}`} className="btn btn-outline btn-sm">
              <IconCheck size={14} /> Read
            </Link>
          ) : (
            <Link to={`/books/${book.slug}`} className="btn btn-outline btn-sm">
              View Book <IconArrowRight size={14} />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

export function BookGrid({ books, ownedIds, progressOf }: {
  books: BookWithAuthor[];
  ownedIds?: Set<string>;
  progressOf?: (bookId: string) => number | null | undefined;
}) {
  return (
    <div className="book-grid">
      {books.map((book, i) => {
        const owned = ownedIds?.has(book.id) ?? false;
        const progress = progressOf ? progressOf(book.id) : undefined;
        return (
          <Reveal key={book.id} delay={Math.min(i, 5) * 70}>
            <BookCard book={book} owned={owned} progress={progress} />
          </Reveal>
        );
      })}
    </div>
  );
}