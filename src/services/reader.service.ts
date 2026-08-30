import type { Book, Bookmark, Chapter, ChapterBlock, ReaderPrefs } from '@/types';
import {
  addBookmark,
  canReadChapter,
  delay,
  getBook,
  getBookmarks,
  getChapter,
  getChapters,
  getSettings,
  hasEntitlement,
  isSampleChapter,
  removeBookmark,
  saveProgress,
  trackEvent,
} from '@/lib/store';
import { DEFAULT_READER_PREFS } from '@/config/site';

export class AccessDeniedError extends Error {}

export interface ReaderAccess {
  book: Book;
  chapter: Chapter;
  chapters: Chapter[];
  entitlement: boolean;
  sample: boolean;
  watermark: string | null;
}

export async function getReaderAccess(
  userId: string | null,
  bookId: string,
  chapterId: string,
): Promise<ReaderAccess> {
  await delay(120);
  const book = getBook(bookId);
  const chapter = getChapter(chapterId);
  if (!book || !chapter || chapter.bookId !== bookId) {
    throw new AccessDeniedError('Chapter not found');
  }
  if (book.status === 'draft') {
    throw new AccessDeniedError('This book is not available');
  }
  const chapters = getChapters(bookId, true);
  const sample = isSampleChapter(book, chapter);
  const entitlement = userId ? hasEntitlement(userId, bookId) : false;

  if (!canReadChapter(userId, book, chapter)) {
    throw new AccessDeniedError(
      sample
        ? 'Sample chapters are open to everyone.'
        : 'This chapter is part of the complete book. Purchase to continue reading.',
    );
  }

  const settings = getSettings();
  const watermark =
    settings.watermarkReaders && userId ? `SNS Books · Reader ref ${userId.slice(-6)}` : null;

  return { book, chapter, chapters, entitlement, sample, watermark };
}

export interface ChapterRange {
  prev: Chapter | null;
  next: Chapter | null;
}

export function getChapterRange(chapters: Chapter[], current: Chapter): ChapterRange {
  const index = chapters.findIndex((c) => c.id === current.id);
  if (index < 0) return { prev: null, next: null };
  return {
    prev: index > 0 ? chapters[index - 1] : null,
    next: index < chapters.length - 1 ? chapters[index + 1] : null,
  };
}

export function recordProgress(data: {
  userId: string;
  bookId: string;
  chapterId: string;
  position: number;
  percentage: number;
}): void {
  saveProgress(data);
}

export function recordRead(userId: string | null, bookId: string, type: 'book_view' | 'reader_open' | 'reader_complete' | 'sample_read'): void {
  trackEvent({ type, userId, bookId });
}

/* ------------------------------------------------------------------ */
/* Bookmarks                                                           */
/* ------------------------------------------------------------------ */

export interface BookmarkWithMeta extends Bookmark {
  book: Book | null;
  chapterTitle: string;
}

export async function getMyBookmarks(userId: string): Promise<BookmarkWithMeta[]> {
  await delay(140);
  return getBookmarks(userId).map((b) => ({
    ...b,
    book: b.book ?? null,
    chapterTitle: b.chapterTitle,
  }));
}

export function createBookmark(data: {
  userId: string;
  bookId: string;
  chapterId: string;
  position: number;
}): Bookmark {
  return addBookmark(data);
}

export function deleteBookmark(userId: string, bookmarkId: string): void {
  removeBookmark(userId, bookmarkId);
}

/* ------------------------------------------------------------------ */
/* Reader preferences (local + syncable to profile)                    */
/* ------------------------------------------------------------------ */

const PREF_KEY = 'sns.books.readerPrefs';

export function getReaderPrefs(): ReaderPrefs {
  try {
    const raw = localStorage.getItem(PREF_KEY);
    if (!raw) return { ...DEFAULT_READER_PREFS };
    return { ...DEFAULT_READER_PREFS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_READER_PREFS };
  }
}

export function saveReaderPrefs(prefs: ReaderPrefs): void {
  localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
}

/* ------------------------------------------------------------------ */
/* Rendering helpers                                                   */
/* ------------------------------------------------------------------ */

export function renderBlocks(blocks: ChapterBlock[]): string {
  return blocks
    .map((b) => (b.type === 'heading' ? `## ${b.text}` : b.text))
    .join('\n\n');
}

export function parseBlocks(raw: string): ChapterBlock[] {
  return raw
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      if (p.startsWith('## ')) return { type: 'heading' as const, text: p.slice(3) };
      if (p.startsWith('### ')) return { type: 'quote' as const, text: p.slice(4) };
      return { type: 'paragraph' as const, text: p };
    });
}

export function estimateReadMinutes(blocks: ChapterBlock[]): number {
  const words = blocks.reduce((n, b) => n + b.text.split(/\s+/).length, 0);
  return Math.max(1, Math.round(words / 200));
}