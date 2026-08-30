import type {
  AnalyticsEvent,
  Book,
  Bookmark,
  BookWithAuthor,
  Chapter,
  Coupon,
  CurrencyCode,
  Entitlement,
  LibraryEntry,
  Money,
  Order,
  PaymentTransaction,
  ReadingProgress,
  SiteSettings,
  User,
  Author,
} from '@/types';
import {
  seedAuthor,
  seedBooks,
  seedChapters,
  seedSettings,
  seedUsers,
} from '@/data/seed';

/* ------------------------------------------------------------------ */
/* SNS Books data store                                                */
/*                                                                     */
/* This module simulates the backend persistence layer. It keeps the   */
/* same shape as a production service (collections + transactions) so  */
/* it can be replaced by Firebase / FastAPI without rewriting pages.   */
/* All writes go through here; entitlement checks below mirror the     */
/* server-side authorization that must exist in production.            */
/* ------------------------------------------------------------------ */

const PREFIX = 'sns.books.';
const CACHE: Record<string, unknown[]> = {};
let booted = false;

export function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function delay(ms = 240): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms + Math.random() * 180));
}

function read<T>(key: string): T[] {
  if (CACHE[key]) return CACHE[key] as T[];
  try {
    const raw = localStorage.getItem(PREFIX + key);
    const value = raw ? (JSON.parse(raw) as T[]) : [];
    CACHE[key] = value;
    return value;
  } catch {
    return [];
  }
}

function write<T>(key: string, value: T[]): void {
  CACHE[key] = value;
  localStorage.setItem(PREFIX + key, JSON.stringify(value));
}

function insert<T extends { id: string }>(key: string, record: T): T {
  const col = read<T>(key);
  col.push(record);
  write(key, col);
  return record;
}

function upsert<T extends { id: string }>(key: string, record: T): T {
  const col = read<T>(key);
  const idx = col.findIndex((r) => r.id === record.id);
  if (idx >= 0) col[idx] = record;
  else col.push(record);
  write(key, col);
  return record;
}

function removeId<T extends { id: string }>(key: string, id: string): void {
  write(
    key,
    read<T>(key).filter((r) => r.id !== id),
  );
}

function clearAll(): void {
  const keys = Object.keys(localStorage).filter((k) => k.startsWith(PREFIX));
  keys.forEach((k) => localStorage.removeItem(k));
  Object.keys(CACHE).forEach((k) => delete CACHE[k]);
}

/* ------------------------------------------------------------------ */
/* Boot / seed                                                         */
/* ------------------------------------------------------------------ */

const BOOT_FLAG = 'sns.books.seeded.v2';

export function boot(): void {
  if (booted) return;
  booted = true;
  if (localStorage.getItem(BOOT_FLAG)) return;

  seedUsers.forEach((u) => insert<User>('users', u));
  insert<Author>('authors', seedAuthor);
  seedBooks().forEach((b) => insert<Book>('books', b));
  seedChapters().forEach((c) => insert<Chapter>('chapters', c));
  write<SiteSettings>('settings', [seedSettings]);
  insert<Coupon>('coupons', {
    id: 'coupon-demo',
    code: 'SNS10',
    percentOff: 10,
    active: true,
    createdAt: new Date().toISOString(),
  });

  localStorage.setItem(BOOT_FLAG, 'done');
}

export function resetDemoData(): void {
  clearAll();
  booted = false;
  boot();
}

/* ------------------------------------------------------------------ */
/* Generic queries                                                     */
/* ------------------------------------------------------------------ */

export type CollectionName =
  | 'users'
  | 'authors'
  | 'books'
  | 'chapters'
  | 'orders'
  | 'payments'
  | 'entitlements'
  | 'progress'
  | 'bookmarks'
  | 'settings'
  | 'coupons'
  | 'events'
  | 'wishlist';

export const db = {
  read: <T>(key: CollectionName): T[] => read<T>(key),
  write: <T>(key: CollectionName, value: T[]): void => write(key, value),
  insert: <T extends { id: string }>(key: CollectionName, record: T): T =>
    insert(key, record),
  upsert: <T extends { id: string }>(key: CollectionName, record: T): T =>
    upsert(key, record),
  removeId: <T extends { id: string }>(key: CollectionName, id: string): void =>
    removeId<T>(key, id),
};

/* ------------------------------------------------------------------ */
/* Pricing (authoritative, "server-side")                              */
/* ------------------------------------------------------------------ */

export function exchangeRate(to: CurrencyCode): number {
  const s = db.read<SiteSettings>('settings')[0] ?? seedSettings;
  const base = s.basePrices[s.defaultCurrency] ?? 15000;
  const target = s.basePrices[to] ?? base;
  return target / base;
}

export function computePrice(book: Book, currency: CurrencyCode): Money {
  const { amount } = book.price;
  const converted = convertAmount(amount, book.price.currency, currency);
  return { amount: converted, currency };
}

export function convertAmount(amount: number, from: CurrencyCode, to: CurrencyCode): number {
  if (from === to) return amount;
  const s = db.read<SiteSettings>('settings')[0] ?? seedSettings;
  const baseCurrency = s.defaultCurrency;
  const fromBase = s.basePrices[from] ?? 1;
  const toBase = s.basePrices[to] ?? 1;
  const valueInBase = (amount / fromBase) * s.basePrices[baseCurrency];
  const converted = (valueInBase / s.basePrices[baseCurrency]) * toBase;
  return roundMoney(converted, to);
}

export function roundMoney(amount: number, currency: CurrencyCode): number {
  return currency === 'TZS' ? Math.round(amount) : Math.round(amount * 100) / 100;
}

export function applyCoupon(amount: number, coupon: Coupon | null): number {
  if (!coupon) return amount;
  return Math.max(0, amount - (amount * coupon.percentOff) / 100);
}

export function getCoupon(code: string): Coupon | null {
  const coupon = db
    .read<Coupon>('coupons')
    .find((c) => c.code.toLowerCase() === code.trim().toLowerCase() && c.active);
  return coupon ?? null;
}

/* ------------------------------------------------------------------ */
/* Auth                                                                */
/* ------------------------------------------------------------------ */

export interface AuthUser extends Omit<User, 'passwordHash'> {
  token: string;
}

export function createUser(data: {
  name: string;
  email: string;
  password: string;
  country: string;
}): User {
  const user: User = {
    id: uid('user'),
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    country: data.country.trim() || 'Tanzania',
    role: 'USER',
    disabled: false,
    createdAt: new Date().toISOString(),
    passwordHash: `demo:${data.password}`,
  };
  db.insert<User>('users', user);
  return user;
}

export function findByEmail(email: string): User | undefined {
  return db
    .read<User>('users')
    .find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
}

export function verifyPassword(user: User, password: string): boolean {
  if (!user.passwordHash.startsWith('demo:')) return false;
  return user.passwordHash === `demo:${password}`;
}

const SESSION_KEY = 'sns.books.session';

export function setSession(session: { userId: string; token: string } | null): void {
  if (!session) {
    localStorage.removeItem(SESSION_KEY);
    return;
  }
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ ...session, createdAt: new Date().toISOString(), expiresAt: '' }),
  );
}

export function getSessionToken(): string | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as { userId: string; token: string };
    return session.token ?? null;
  } catch {
    return null;
  }
}

export function hasValidSession(): boolean {
  return Boolean(getSessionToken());
}

export function tokenOwnerId(): string | null {
  const token = getSessionToken();
  if (!token) return null;
  // Demo: the payload is "uid:<userId>".
  const match = /^uid:(\w+)$/.exec(token);
  return match ? match[1] : null;
}

export function publicUser(user: User, token: string): AuthUser {
  const { passwordHash: _ph, ...rest } = user;
  return { ...rest, token };
}

export function getSettings(): SiteSettings {
  return db.read<SiteSettings>('settings')[0] ?? seedSettings;
}

/* ------------------------------------------------------------------ */
/* Related lookups                                                     */
/* ------------------------------------------------------------------ */

export function getBook(id: string): Book | undefined {
  return db.read<Book>('books').find((b) => b.id === id);
}

export function getBookBySlug(slug: string): Book | undefined {
  return db.read<Book>('books').find((b) => b.slug === slug);
}

export function getAuthor(id: string): Author | undefined {
  return db.read<Author>('authors').find((a) => a.id === id);
}

export function bookWithAuthor(book: Book): BookWithAuthor {
  return { ...book, author: getAuthor(book.authorId) ?? null };
}

export function getChapter(id: string): Chapter | undefined {
  return db.read<Chapter>('chapters').find((c) => c.id === id);
}

export function getChapters(bookId: string, publishedOnly = false): Chapter[] {
  return db
    .read<Chapter>('chapters')
    .filter((c) => c.bookId === bookId && (!publishedOnly || c.published))
    .sort((a, b) => a.order - b.order);
}

/* ------------------------------------------------------------------ */
/* Entitlements                                                        */
/* ------------------------------------------------------------------ */

export function getEntitlement(userId: string, bookId: string): Entitlement | undefined {
  return db
    .read<Entitlement>('entitlements')
    .find((e) => e.userId === userId && e.bookId === bookId);
}

export function hasEntitlement(userId: string, bookId: string): boolean {
  return Boolean(getEntitlement(userId, bookId));
}

export function isSampleChapter(book: Book, chapter: Chapter): boolean {
  return chapter.order < Math.max(0, book.sampleCount);
}

export function canReadChapter(userId: string | null, book: Book, chapter: Chapter): boolean {
  if (book.status === 'draft') return false;
  if (isSampleChapter(book, chapter)) return true;
  if (!userId) return false;
  return hasEntitlement(userId, book.id);
}

/* ------------------------------------------------------------------ */
/* Library                                                             */
/* ------------------------------------------------------------------ */

export function getLibrary(userId: string): LibraryEntry[] {
  const entitlements = db
    .read<Entitlement>('entitlements')
    .filter((e) => e.userId === userId)
    .sort((a, b) => b.grantedAt.localeCompare(a.grantedAt));
  const progressAll = db.read<ReadingProgress>('progress');

  const entries: LibraryEntry[] = [];
  for (const e of entitlements) {
    const book = getBook(e.bookId);
    if (!book) continue;
    entries.push({
      entitlementId: e.id,
      book: bookWithAuthor(book),
      progress: progressAll.find((p) => p.userId === userId && p.bookId === e.bookId) ?? null,
      orderId: e.orderId,
      grantedAt: e.grantedAt,
    });
  }
  return entries;
}

/* ------------------------------------------------------------------ */
/* Reading progress + bookmarks                                        */
/* ------------------------------------------------------------------ */

export function saveProgress(
  data: Omit<ReadingProgress, 'userId' | 'lastReadAt'> & { userId: string },
): ReadingProgress {
  const progress: ReadingProgress = { ...data, lastReadAt: new Date().toISOString() };
  const col = db.read<ReadingProgress>('progress');
  const idx = col.findIndex((p) => p.userId === data.userId && p.bookId === data.bookId);
  if (idx >= 0) col[idx] = progress;
  else col.push(progress);
  db.write('progress', col);
  return progress;
}

export function getProgress(userId: string, bookId: string): ReadingProgress | null {
  return (
    db
      .read<ReadingProgress>('progress')
      .find((p) => p.userId === userId && p.bookId === bookId) ?? null
  );
}

export function getProgressForUser(userId: string): ReadingProgress[] {
  return db
    .read<ReadingProgress>('progress')
    .filter((p) => p.userId === userId)
    .sort((a, b) => b.lastReadAt.localeCompare(a.lastReadAt));
}

export function addBookmark(data: {
  userId: string;
  bookId: string;
  chapterId: string;
  position: number;
  note?: string;
}): Bookmark {
  const book = getBook(data.bookId);
  const chapter = getChapter(data.chapterId);
  const bookmark: Bookmark = {
    id: uid('bm'),
    userId: data.userId,
    bookId: data.bookId,
    chapterId: data.chapterId,
    chapterTitle: chapter?.title ?? 'Untitled',
    position: data.position,
    note: data.note,
    createdAt: new Date().toISOString(),
  };
  void book;
  db.insert<Bookmark>('bookmarks', bookmark);
  return bookmark;
}

export function getBookmarks(userId: string): (Bookmark & { book: BookWithAuthor | null })[] {
  return db
    .read<Bookmark>('bookmarks')
    .filter((b) => b.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((b) => {
      const book = getBook(b.bookId);
      return { ...b, book: book ? bookWithAuthor(book) : null };
    });
}

export function removeBookmark(userId: string, bookmarkId: string): void {
  const col = db
    .read<Bookmark>('bookmarks')
    .filter((b) => !(b.userId === userId && b.id === bookmarkId));
  db.write('bookmarks', col);
}

/* ------------------------------------------------------------------ */
/* Orders + payments (entitlement transaction)                         */
/* ------------------------------------------------------------------ */

export function placeOrder(data: {
  userId: string;
  bookId: string;
  currency: CurrencyCode;
  coupon: Coupon | null;
  paymentMethod: string;
  provider: string;
}): { order: Order; payment: PaymentTransaction } {
  const book = getBook(data.bookId);
  if (!book) throw new Error('Book not found');

  const gross = convertAmount(book.price.amount, book.price.currency, data.currency);
  const total = applyCoupon(gross, data.coupon);
  const rounded = roundMoney(total, data.currency);

  const reference = `SNS-${Date.now().toString(36).toUpperCase()}`;
  const order: Order = {
    id: uid('ord'),
    userId: data.userId,
    items: [
      {
        bookId: book.id,
        title: book.title,
        quantity: 1,
        price: { amount: rounded, currency: data.currency },
      },
    ],
    total: { amount: rounded, currency: data.currency },
    paymentMethod: data.paymentMethod,
    provider: data.provider,
    reference,
    status: 'paid',
    createdAt: new Date().toISOString(),
  };
  db.insert<Order>('orders', order);

  const payment: PaymentTransaction = {
    id: uid('pay'),
    orderId: order.id,
    userId: data.userId,
    provider: data.provider,
    method: data.paymentMethod,
    amount: { amount: rounded, currency: data.currency },
    reference,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };
  db.insert<PaymentTransaction>('payments', payment);

  const entitlement: Entitlement = {
    id: uid('ent'),
    userId: data.userId,
    bookId: book.id,
    orderId: order.id,
    grantedAt: new Date().toISOString(),
  };
  db.insert<Entitlement>('entitlements', entitlement);

  db.insert<AnalyticsEvent>('events', {
    id: uid('ev'),
    type: 'purchase',
    userId: data.userId,
    bookId: book.id,
    meta: { amount: rounded, currency: data.currency, method: data.paymentMethod },
    at: new Date().toISOString(),
  });

  return { order, payment };
}

export function hasPurchased(userId: string, bookId: string): boolean {
  return db
    .read<Order>('orders')
    .some((o) => o.userId === userId && o.status === 'paid' && o.items.some((i) => i.bookId === bookId));
}

/* ------------------------------------------------------------------ */
/* Analytics                                                           */
/* ------------------------------------------------------------------ */

export function trackEvent(event: Omit<AnalyticsEvent, 'id' | 'at'>): void {
  db.insert<AnalyticsEvent>('events', { ...event, id: uid('ev'), at: new Date().toISOString() });
}

export function getEvents(): AnalyticsEvent[] {
  return db.read<AnalyticsEvent>('events');
}