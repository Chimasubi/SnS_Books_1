import type { LibraryEntry, ReadingProgress } from '@/types';
import { db, delay, getBook, getLibrary, getProgressForUser } from '@/lib/store';

export async function getMyLibrary(userId: string): Promise<LibraryEntry[]> {
  await delay(180);
  return getLibrary(userId);
}

export interface HistoryEntry {
  bookId: string;
  chapterId: string;
  chapterTitle: string;
  bookTitle: string;
  authorName: string;
  percentage: number;
  lastReadAt: string;
}

export async function getReadingHistory(userId: string): Promise<HistoryEntry[]> {
  await delay(160);
  const progress = getProgressForUser(userId);
  const history: HistoryEntry[] = [];
  for (const p of progress) {
    const book = getBook(p.bookId);
    if (!book) continue;
    const chapter = db
      .read<{ id: string; title: string }>('chapters')
      .find((c) => c.id === p.chapterId);
    const author = db
      .read<{ id: string; name: string }>('authors')
      .find((a) => a.id === book.authorId);
    history.push({
      bookId: book.id,
      chapterId: p.chapterId,
      chapterTitle: chapter?.title ?? 'Unknown chapter',
      bookTitle: book.title,
      authorName: author?.name ?? '',
      percentage: p.percentage,
      lastReadAt: p.lastReadAt,
    });
  }
  return history;
}

export function saveReadingProgress(data: Omit<ReadingProgress, 'lastReadAt'>): void {
  const ref = {
    userId: data.userId,
    bookId: data.bookId,
    chapterId: data.chapterId,
    position: data.position,
    percentage: data.percentage,
    lastReadAt: new Date().toISOString(),
  };
  localStorage.setItem(
    'sns.books.reading.' + data.userId,
    JSON.stringify({ ...ref, cachedAt: new Date().toISOString() }),
  );
}