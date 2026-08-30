import type { Book, BookWithAuthor, Chapter } from '@/types';
import {
  db,
  delay,
  getBook,
  getBookBySlug,
  bookWithAuthor,
  getAuthor,
} from '@/lib/store';

export interface BookDetail {
  book: BookWithAuthor;
  chapters: Chapter[];
  related: BookWithAuthor[];
}

export async function listBooks(opts?: { status?: 'published'; featured?: boolean }): Promise<BookWithAuthor[]> {
  await delay();
  const books = db.read<Book>('books');
  const filtered = books
    .filter((b) => (opts?.status ? b.status === opts.status : b.status !== 'draft'))
    .sort((a, b) => a.eduNumber.localeCompare(b.eduNumber))
    .filter((b) => (opts?.featured ? b.featured : true));
  return filtered.map((b) => bookWithAuthor(b));
}

export async function getBookDetail(slug: string): Promise<BookDetail | null> {
  await delay(180);
  const book = getBookBySlug(slug);
  if (!book) return null;
  const chapters = db
    .read<Chapter>('chapters')
    .filter((c) => c.bookId === book.id && c.published)
    .sort((a, b) => a.order - b.order);
  const related = db
    .read<Book>('books')
    .filter(
      (b) =>
        b.id !== book.id &&
        b.status !== 'draft' &&
        (b.category === book.category || b.featured),
    )
    .sort((a, b) => Number(b.featured) - Number(a.featured))
    .slice(0, 3)
    .map((b) => bookWithAuthor(b));

  return {
    book: bookWithAuthor(book),
    chapters,
    related,
  };
}

export async function getBookById(id: string): Promise<Book | null> {
  await delay(60);
  return getBook(id) ?? null;
}

export interface SearchResult {
  books: BookWithAuthor[];
  chapters: { chapter: Chapter; book: BookWithAuthor }[];
}

export async function searchCatalog(query: string): Promise<SearchResult> {
  await delay(160);
  const q = query.trim().toLowerCase();
  if (!q) return { books: [], chapters: [] };

  const books = db.read<Book>('books');
  const chapters = db.read<Chapter>('chapters');

  const authorMatches = (b: Book) => {
    const author = getAuthor(b.authorId);
    return author ? author.name.toLowerCase().includes(q) : false;
  };

  const bookMatches = books.filter(
    (b) =>
      b.status !== 'draft' &&
      (b.title.toLowerCase().includes(q) ||
        b.subtitle.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        authorMatches(b)),
  );

  const chapterMatches = chapters
    .filter((c) => c.published && c.title.toLowerCase().includes(q))
    .slice(0, 8)
    .map((c) => {
      const book = books.find((b) => b.id === c.bookId && b.status !== 'draft');
      if (!book) return null;
      return { chapter: c, book: bookWithAuthor(book) };
    })
    .filter((x): x is { chapter: Chapter; book: BookWithAuthor } => x !== null);

  return {
    books: bookMatches.map((b) => bookWithAuthor(b)),
    chapters: chapterMatches,
  };
}