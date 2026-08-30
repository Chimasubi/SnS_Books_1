import { db, trackEvent } from '@/lib/store';
import type { AnalyticsEvent, Book, Order, PaymentTransaction } from '@/types';

export type DashboardStats = {
  books: number;
  users: number;
  orders: number;
  revenue: number;
  revenueCurrency: string;
  activeReaders: number;
  completionRate: number;
  recentOrders: Order[];
  mostRead: { bookId: string; title: string; reads: number }[];
  salesByDay: { day: string; orders: number; revenue: number }[];
  popularBook: { title: string; sales: number } | null;
};

const TZS = 'TZS';

export function getDashboardStats(): DashboardStats {
  const books = db.read<Book>('books');
  const users = db.read<{ role: string; disabled: boolean }>('users');
  const orders = db.read<Order>('orders');
  const payments = db.read<PaymentTransaction>('payments');
  const events = db.read<AnalyticsEvent>('events');

  const paidOrders = orders.filter((o) => o.status === 'paid');
  const revenue = paidOrders.reduce((sum, o) => sum + o.total.amount, 0);

  const activeReaders = new Set(
    events
      .filter((e) => e.type === 'reader_open')
      .map((e) => e.userId)
      .filter((u): u is string => Boolean(u)),
  ).size;

  const completionEvents = events.filter((e) => e.type === 'reader_complete');
  const completionRate =
    events.filter((e) => e.type === 'reader_open').length > 0
      ? Math.round(
          (completionEvents.length / Math.max(1, events.filter((e) => e.type === 'reader_open').length)) *
            100,
        )
      : 0;

  const readCounts = new Map<string, number>();
  events.forEach((e) => {
    if (e.type === 'reader_open' && e.bookId) {
      readCounts.set(e.bookId, (readCounts.get(e.bookId) ?? 0) + 1);
    }
  });
  const mostRead = [...readCounts.entries()]
    .map(([bookId, reads]) => {
      const book = books.find((b) => b.id === bookId);
      return { bookId, title: book?.title ?? 'Unknown book', reads };
    })
    .sort((a, b) => b.reads - a.reads)
    .slice(0, 5);

  const salesByBook = new Map<string, number>();
  paidOrders.forEach((o) =>
    o.items.forEach((i) => salesByBook.set(i.bookId, (salesByBook.get(i.bookId) ?? 0) + 1)),
  );
  const top = [...salesByBook.entries()].sort((a, b) => b[1] - a[1])[0];
  const popularBook = top
    ? { title: books.find((b) => b.id === top[0])?.title ?? 'Unknown', sales: top[1] }
    : null;

  const days: { day: string; orders: number; revenue: number }[] = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString();
    const dayOrders = paidOrders.filter((o) => {
      const od = new Date(o.createdAt);
      od.setHours(0, 0, 0, 0);
      return od.toISOString() === key;
    });
    return {
      day: d.toLocaleDateString('en-GB', { weekday: 'short' }),
      orders: dayOrders.length,
      revenue: dayOrders.reduce((s, o) => s + o.total.amount, 0),
    };
  });

  void payments;

  return {
    books: books.length,
    users: users.filter((u) => u.role === 'USER').length,
    orders: orders.length,
    revenue,
    revenueCurrency: TZS,
    activeReaders,
    completionRate,
    recentOrders: orders.slice(-6).reverse(),
    mostRead,
    salesByDay: days,
    popularBook,
  };
}

export function pageView(page: string): void {
  trackEvent({ type: 'page_view', userId: null, meta: { page } });
}