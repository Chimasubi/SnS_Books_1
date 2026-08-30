export const APP_NAME = 'SNS Books';
export const APP_SHORT_NAME = 'SNS Books';
export const BRAND_NAME = 'SIMULIZI NA SAUTI';
export const AUTHOR_NAME = 'Fredrick Bundala';
export const AUTHOR_ALIAS = 'The SkyWalker';
export const AUTHOR_DISPLAY = `${AUTHOR_NAME} '${AUTHOR_ALIAS}'`;
export const TAGLINE = 'Stories. Lives. Legacies.';

export const PRIMARY_AUTHOR_ID = 'author-frederick';

export const DEFAULT_READER_PREFS = {
  fontFamily: 'literata' as const,
  fontSize: 17,
  lineHeight: 'comfortable' as const,
  theme: 'dark' as const,
};

export const SUPPORTED_CURRENCIES = ['TZS', 'USD', 'EUR', 'GBP'] as const;

export const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Books', to: '/books' },
  { label: 'The Author', to: '/author' },
  { label: 'About SNS', to: '/about' },
];

export const DEMO_CREDENTIALS = {
  reader: { email: 'reader@sns.books', password: 'reader123', label: 'Reader demo' },
  admin: { email: 'admin@sns.books', password: 'admin123', label: 'Admin demo' },
};