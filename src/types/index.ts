export type Role = 'USER' | 'ADMIN' | 'AUTHOR';

export type CurrencyCode = 'TZS' | 'USD' | 'EUR' | 'GBP';

export type BookStatus = 'published' | 'draft' | 'coming_soon';

export type BookAccent = 'featured' | 'sample';

export interface Money {
  amount: number;
  currency: CurrencyCode;
}

export interface User {
  id: string;
  name: string;
  email: string;
  country: string;
  role: Role;
  disabled: boolean;
  createdAt: string;
  passwordHash: string;
}

export type PublicUser = Omit<User, 'passwordHash'>;

export interface TimelineEntry {
  id: string;
  label: string;
  year?: string;
  title: string;
  body: string;
}

export interface Author {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  badge?: string;
  country: string;
  bio: string[];
  portraitNote?: string;
  quote?: string;
  stats: { label: string; value: string }[];
  timeline: TimelineEntry[];
}

export type ChapterBlockType = 'paragraph' | 'heading' | 'quote';

export interface ChapterBlock {
  type: ChapterBlockType;
  text: string;
}

export interface Chapter {
  id: string;
  bookId: string;
  title: string;
  slug: string;
  order: number;
  content: ChapterBlock[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Book {
  id: string;
  title: string;
  slug: string;
  subtitle: string;
  eduNumber: string;
  authorId: string;
  description: string;
  about: string;
  whatsInside: string[];
  category: string;
  cover: string | null;
  palette: string;
  price: Money;
  status: BookStatus;
  featured: boolean;
  sampleCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  demo: boolean;
}

export interface WishlistItem {
  userId: string;
  bookId: string;
  createdAt: string;
}

export interface OrderItem {
  bookId: string;
  title: string;
  quantity: number;
  price: Money;
}

export type OrderStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: Money;
  paymentMethod: string;
  provider: string;
  reference: string;
  status: OrderStatus;
  createdAt: string;
}

export type PaymentStatus = 'created' | 'pending' | 'confirmed' | 'failed';

export interface PaymentTransaction {
  id: string;
  orderId: string | null;
  userId: string;
  provider: string;
  method: string;
  amount: Money;
  reference: string;
  status: PaymentStatus;
  createdAt: string;
}

export interface Entitlement {
  id: string;
  userId: string;
  bookId: string;
  orderId: string;
  grantedAt: string;
}

export interface ReadingProgress {
  userId: string;
  bookId: string;
  chapterId: string;
  position: number;
  percentage: number;
  lastReadAt: string;
}

export interface Bookmark {
  id: string;
  userId: string;
  bookId: string;
  chapterId: string;
  chapterTitle: string;
  position: number;
  note?: string;
  createdAt: string;
}

export type AnalyticsEventType =
  | 'page_view'
  | 'book_view'
  | 'sample_read'
  | 'purchase'
  | 'reader_open'
  | 'reader_complete';

export interface AnalyticsEvent {
  id: string;
  type: AnalyticsEventType;
  userId: string | null;
  bookId?: string;
  meta?: Record<string, unknown>;
  at: string;
}

export interface SiteSettings {
  shopName: string;
  tagline: string;
  announcement: string | null;
  allowRegistration: boolean;
  basePrices: Record<CurrencyCode, number>;
  currenciesEnabled: CurrencyCode[];
  defaultCurrency: CurrencyCode;
  watermarkReaders: boolean;
  offlineReading: boolean;
}

export interface Session {
  userId: string;
  token: string;
  createdAt: string;
  expiresAt: string;
}

export interface BookWithAuthor extends Book {
  author: Author | null;
}

export interface LibraryEntry {
  entitlementId: string;
  book: BookWithAuthor;
  progress: ReadingProgress | null;
  orderId: string;
  grantedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  percentOff: number;
  active: boolean;
  createdAt: string;
}

export type ReaderTheme = 'light' | 'dark' | 'sepia';

export interface ReaderPrefs {
  fontFamily: 'literata' | 'source-serif' | 'georgia';
  fontSize: number;
  lineHeight: 'compact' | 'comfortable' | 'relaxed';
  theme: ReaderTheme;
}

export interface PaymentMethodInfo {
  id: string;
  label: string;
  detail: string;
}

export interface PaymentOption {
  providerId: string;
  providerName: string;
  methods: PaymentMethodInfo[];
  currencies: CurrencyCode[];
}