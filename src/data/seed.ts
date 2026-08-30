import type {
  Author,
  Book,
  Chapter,
  ChapterBlock,
  CurrencyCode,
  SiteSettings,
  User,
} from '@/types';
import { PRIMARY_AUTHOR_ID } from '@/config/site';

export const IDS = {
  adminUser: 'user-admin-demo',
  readerUser: 'user-reader-demo',
  author: PRIMARY_AUTHOR_ID,
};

/* ------------------------------------------------------------------ */
/* Demo users (clearly demo — replace with a real auth flow in prod)  */
/* ------------------------------------------------------------------ */

export const seedUsers: User[] = [
  {
    id: IDS.adminUser,
    name: 'SNS Administrator',
    email: 'admin@sns.books',
    passwordHash: 'demo:admin123',
    country: 'Tanzania',
    role: 'ADMIN',
    disabled: false,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: IDS.readerUser,
    name: 'Demo Reader',
    email: 'reader@sns.books',
    passwordHash: 'demo:reader123',
    country: 'Tanzania',
    role: 'USER',
    disabled: false,
    createdAt: '2026-02-14T00:00:00.000Z',
  },
];

/* ------------------------------------------------------------------ */
/* Author                                                              */
/* ------------------------------------------------------------------ */

export const seedAuthor: Author = {
  id: PRIMARY_AUTHOR_ID,
  name: 'Fredrick Bundala',
  slug: 'fredrick-bundala-skywalker',
  tagline: "Journalist · Media leader · Author · 'The SkyWalker'",
  badge: 'Founder, SNS',
  country: 'Tanzania',
  portraitNote:
    '[ Placeholder portrait — replace with an approved photograph of Fredrick Bundala (The SkyWalker) via the admin. ]',
  bio: [
    "Fredrick Bundala, widely known as 'The SkyWalker', is a Tanzanian media leader and journalist, and the founder of Simulizi na Sauti (SNS), a premium African media organisation. This biography is a placeholder and will be replaced with official copy when it is provided.",
  ],
  quote:
    'Every story we tell is a life we choose to carry forward. – Placeholder quote',
  stats: [
    { label: 'Books', value: '5' },
    { label: 'Years in media', value: '—' },
    { label: 'Stories told', value: '—' },
  ],
  timeline: [
    {
      id: 't-beginning',
      label: 'Beginning',
      title: 'Origins',
      body: 'Placeholder — Fredrick\u2019s early years will appear here when provided.',
    },
    {
      id: 't-career',
      label: 'Career',
      title: 'The professional years',
      body: 'Placeholder — his professional journey will appear here when provided.',
    },
    {
      id: 't-media',
      label: 'Media',
      title: 'Building a media voice',
      body: 'Placeholder — the founding story of SNS will appear here when provided.',
    },
    {
      id: 't-sns',
      label: 'SNS',
      title: 'Simulizi na Sauti',
      body: 'Placeholder — the SNS story will appear here when provided.',
    },
    {
      id: 't-author',
      label: 'Author',
      title: 'The books',
      body: 'Placeholder — the writing journey and first publications will appear here when provided.',
    },
    {
      id: 't-today',
      label: 'Today',
      title: 'The road ahead',
      body: 'Placeholder — current work and what lies ahead will appear here when provided.',
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Books                                                               */
/* ------------------------------------------------------------------ */

export interface SeedBookConfig {
  id: string;
  title: string;
  subtitle: string;
  eduNumber: string;
  description: string;
  about: string[];
  whatsInside: string[];
  category: string;
  palette: string;
  price: { amount: number; currency: CurrencyCode };
  status: Book['status'];
  featured: boolean;
  sampleCount: number;
}

export const seedBooksConfig: SeedBookConfig[] = [
  {
    id: 'book-01',
    title: 'The First Fire',
    subtitle: 'A novel of beginnings',
    eduNumber: 'BOOK 01',
    description:
      'A sweeping story about the first light of a new generation \u2014 and the quiet courage it takes to carry a legacy forward.',
    about: [
      'THE FIRST FIRE is the opening work in the SNS Books collection \u2014 a placeholder title chosen to demonstrate the complete publishing platform.',
      'This placeholder tells a fictional story of beginnings: a family, a country, and the choices that shape both.',
      'Replace this description with the real book details through the admin once final copy is available.',
    ],
    whatsInside: [
      'A complete first chapter available as a free sample',
      'Structured chapters with a comfortable reading experience',
      'Reading progress, bookmarks and personal library',
    ],
    category: 'Fiction',
    palette: 'ember',
    price: { amount: 15000, currency: 'TZS' },
    status: 'published',
    featured: true,
    sampleCount: 1,
  },
  {
    id: 'book-02',
    title: 'Letters to the Horizon',
    subtitle: 'Essays on distance, belonging and dawn',
    eduNumber: 'BOOK 02',
    description:
      'A reflective collection that follows the long arc of a life lived between places \u2014 home, abroad, and the horizon in between.',
    about: [
      'LETTERS TO THE HORIZON is a placeholder collection of essays in the SNS Books catalogue.',
      'The essays trace themes of distance and belonging, of writing home while far from home, and of the places that call to us.',
      'Final essay titles and text will replace this placeholder content through the admin.',
    ],
    whatsInside: [
      'A free sample chapter for readers to preview before buying',
      'Reader themes: light, dark and sepia',
      'Synchronised reading progress across devices',
    ],
    category: 'Essays',
    palette: 'dawn',
    price: { amount: 12500, currency: 'TZS' },
    status: 'published',
    featured: true,
    sampleCount: 1,
  },
  {
    id: 'book-03',
    title: 'The River That Remembers',
    subtitle: 'A story of water, memory and return',
    eduNumber: 'BOOK 03',
    description:
      'A journey down a river that holds the memories of everyone who ever stood on its banks \u2014 and of one family that keeps coming home.',
    about: [
      'THE RIVER THAT REMEMBERS is a placeholder novel in the SNS Books catalogue.',
      'It explores how memory flows like water: it shapes the land, outlasts the people, and always finds its way home.',
      'Final content will replace this placeholder through the admin dashboard.',
    ],
    whatsInside: [
      'Free preview of the first chapter',
      'Bookmarks and notes-ready architecture',
      'Offline-ready reading where permitted',
    ],
    category: 'Fiction',
    palette: 'river',
    price: { amount: 15000, currency: 'TZS' },
    status: 'published',
    featured: false,
    sampleCount: 1,
  },
  {
    id: 'book-04',
    title: 'When the Generations Sing',
    subtitle: 'Music, memory and the voices we inherit',
    eduNumber: 'BOOK 04',
    description:
      'An intimate exploration of sound and heritage \u2014 the songs we inherit, the voices that shape us, and the harmonies that outlive us.',
    about: [
      'WHEN THE GENERATIONS SING is a placeholder title built around themes of music, memory and inheritance.',
      'This work considers how the voices of previous generations carry into the present \u2014 in song, in speech, in the everyday.',
      'Replace this placeholder with the real book description via the admin.',
    ],
    whatsInside: [
      'A free sample chapter to try before you buy',
      'Reader customisation: font, size, line height and theme',
      'Your progress is saved automatically',
    ],
    category: 'Non-fiction',
    palette: 'choir',
    price: { amount: 12500, currency: 'TZS' },
    status: 'coming_soon',
    featured: false,
    sampleCount: 1,
  },
  {
    id: 'book-05',
    title: 'The Weight of a Continent',
    subtitle: 'Reflections from an African century',
    eduNumber: 'BOOK 05',
    description:
      'Reflections on the ideas, hopes and burden of an era \u2014 written from the inside of a continent history is still writing.',
    about: [
      'THE WEIGHT OF A CONTINENT is a placeholder collection of reflections in the SNS Books catalogue.',
      'It speaks to the promise and the pressure of a century unfolding across Africa.',
      'Final reflections and structure will be managed through the admin dashboard.',
    ],
    whatsInside: [
      'Free sample chapter for preview',
      'Secure, entitlement-based access after purchase',
      'Watermark-ready protected distribution',
    ],
    category: 'Non-fiction',
    palette: 'continent',
    price: { amount: 15000, currency: 'TZS' },
    status: 'coming_soon',
    featured: false,
    sampleCount: 1,
  },
];

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function seedBooks(): Book[] {
  const now = new Date().toISOString();
  return seedBooksConfig.map((c) => ({
    id: c.id,
    title: c.title,
    slug: toSlug(c.title),
    subtitle: c.subtitle,
    eduNumber: c.eduNumber,
    authorId: PRIMARY_AUTHOR_ID,
    description: c.description,
    about: c.about.join('\n\n'),
    whatsInside: c.whatsInside,
    category: c.category,
    cover: null,
    palette: c.palette,
    price: c.price,
    status: c.status,
    featured: c.featured,
    sampleCount: c.sampleCount,
    publishedAt: c.status === 'published' ? '2026-01-01T00:00:00.000Z' : null,
    createdAt: now,
    updatedAt: now,
    demo: true,
  }));
}

/* ------------------------------------------------------------------ */
/* Demo chapter content                                                */
/* ------------------------------------------------------------------ */

export interface ChapterSpec {
  bookId: string;
  order: number;
  title: string;
  blocks: [ChapterBlock['type'], string][];
}

const DEMO_NOTICE: [ChapterBlock['type'], string] = [
  'quote',
  'This is placeholder demo content for SNS Books, provided to demonstrate the reading experience. It will be replaced with the final book text.',
];

function fin(bookTitle: string, ch: number, total: number): [ChapterBlock['type'], string][] {
  const n = total - 1;
  const last = ch === n;
  return [
    last
      ? ['heading', 'Continuing the Journey']
      : ['heading', 'The Road Ahead'],
    last
      ? ['paragraph', `${bookTitle} continues beyond this sample chapter. When you purchase the complete book, every chapter becomes available in your library, with your progress saved as you read.`]
      : ['paragraph', `The journey set in motion here continues in the next chapter. As with all SNS Books titles, chapters beyond the free sample are unlocked once the book is purchased and added to your library.`],
    ['paragraph', `SNS Books offers a structured reading experience built for focus: adjust the type size, choose a serif that suits you, change the page theme between light, dark and sepia, and pick up exactly where you left off on any device.`],
    ['paragraph', `You can also bookmark any passage and return to it later. Your reading position is saved automatically so you never lose your place.`],
    DEMO_NOTICE,
  ];
}

function passageOne(theme: string): [ChapterBlock['type'], string][] {
  return [
    ['paragraph', `There are mornings when the idea of home is louder than the place itself. ${theme} begins in that kind of morning — the kind that arrives before the light has decided what it wants to be, suspended between the dark and the day.`],
    ['paragraph', `This chapter is part of the SNS Books demo catalogue: realistic placeholder prose used to demonstrate the reader, library and purchase flows. No part of this text is drawn from the author's real, unpublished work, and none of it should be understood as biography.`],
    ['paragraph', `On the far side of the valley, smoke rose from a household that had not yet learned the news. Somewhere a radio played a song older than the border that divided the two sides of the household's memory. The day had not decided, and so neither had the people.`],
    ['paragraph', `They called him by his father's name and his grandfather's name and, when they were being kind, by his own. In that part of the world a person was never just one name. You carried the whole line with you like a second skin, visible to everyone who knew how to look.`],
  ];
}

const chapterSpecs: ChapterSpec[] = [
  {
    bookId: 'book-01',
    order: 0,
    title: 'The First Morning',
    blocks: [
      ['heading', 'The First Morning'],
      ...passageOne('The First Fire'),
      ['heading', 'The Weight of What Was Carried'],
      ['paragraph', `What had been carried across the border was not luggage. It was a set of habits polite enough to pass as manners, a recipe that smelled like a whole district, the correct way to address an elder, and the precise silence to be kept in the presence of grief. These were the real inheritance.`],
      ['paragraph', `When the train arrived — hours late, as it always was, as if time itself were unhurried here — the boy who would grow into the man at the heart of this story pressed his face against the window and decided that the new country would not change him. It would not know, at first, how much it would come to matter.`],
      ...fin('The First Fire', 0, 3),
    ],
  },
  {
    bookId: 'book-01',
    order: 1,
    title: 'The House on the Hill',
    blocks: [
      ['heading', 'The House on the Hill'],
      ['paragraph', `The house stood on a hill that the town had decided, long ago, belonged to it. The house disagreed, and time had proved the house right: the town had grown and shrunk and grown again, and the house had remained, calmly at the top of everything.`],
      ['paragraph', `Inside, the rooms had been arranged by someone who believed that light mattered more than furniture. Whole afternoons moved slowly across the bare plank floors, and the family, when it gathered, gathered where the light was — as if they were grains settling in the palm of the sun.`],
      ['paragraph', `It was here, at the long kitchen table, that the story of the first fire was told. Later the telling would become ritual, then tradition, then — without anyone deciding it — the family's private scripture, repeated until the children could recite it.`],
      ...fin('The First Fire', 1, 3),
    ],
  },
  {
    bookId: 'book-01',
    order: 2,
    title: 'The Harvest of Names',
    blocks: [
      ['heading', 'The Harvest of Names'],
      ['paragraph', `They named the seasons after the harvests, and they named the harvests after the women and men who first raised them. To speak a season's name was to remember a person. The calendar, in that place, was a memorial nobody could burn.`],
      ['paragraph', `This chapter closes the sample; the remaining chapters of The First Fire become available in your library after purchase. The full book continues the story through its three acts, following the family's fortunes across the years that followed.`],
      ...fin('The First Fire', 2, 3),
    ],
  },
  {
    bookId: 'book-02',
    order: 0,
    title: 'Leaving the Post Office',
    blocks: [
      ['heading', 'Leaving the Post Office'],
      ['paragraph', `The letter had taken three weeks to arrive, and by then the answer it asked for had already been decided, twice, in both directions, and then decided again. I held it the way you hold news: careful with it, as if it might still change its mind.`],
      ...fin('Letters to the Horizon', 0, 3),
    ],
  },
  {
    bookId: 'book-02',
    order: 1,
    title: 'Postcards Are a Kind of Breathing',
    blocks: [
      ['heading', 'Postcards Are a Kind of Breathing'],
      ['paragraph', `People who have never been far from home imagine postcards as trivial. They are not. A postcard is a metre of distance made readable; it is the sender taking their pulse in public and sending you the result.`],
      ...fin('Letters to the Horizon', 1, 3),
    ],
  },
  {
    bookId: 'book-02',
    order: 2,
    title: 'The Horizon Is Not a Place',
    blocks: [
      ['heading', 'The Horizon Is Not a Place'],
      ['paragraph', `You can spend a lifetime convincing yourself the horizon is a place you are going to. It is not. It is a negotiation. The horizon is what remains of a journey once you subtract the arriving.`],
      ...fin('Letters to the Horizon', 2, 3),
    ],
  },
  {
    bookId: 'book-03',
    order: 0,
    title: 'Where the Water Begins',
    blocks: [
      ['heading', 'Where the Water Begins'],
      ['paragraph', `No one agrees where the river begins. The elders say it begins far up, where the plateau lets go of the sky. The surveyor says it begins at the confluence, where two lesser streams give up being separate. The children, sensibly, say it begins wherever you are old enough to swim.`],
      ...fin('The River That Remembers', 0, 3),
    ],
  },
  {
    bookId: 'book-03',
    order: 1,
    title: 'Stones That Remember',
    blocks: [
      ['heading', 'Stones That Remember'],
      ['paragraph', `The people of the valley kept their history in stones. Not words — they had words, and used them well — but stones. A stone by the gate for a birth; a smooth white stone for a marriage; a stone split in half for whatever could not be unsaid.`],
      ...fin('The River That Remembers', 1, 3),
    ],
  },
  {
    bookId: 'book-03',
    order: 2,
    title: 'The Return',
    blocks: [
      ['heading', 'The Return'],
      ['paragraph', `A river returns to the sea the way a person returns to themselves: not in a straight line, but in loops and eddies, remembering every bank it ever leaned against.`],
      ...fin('The River That Remembers', 2, 3),
    ],
  },
  {
    bookId: 'book-04',
    order: 0,
    title: 'The Voice in the Kitchen',
    blocks: [
      ['heading', 'The Voice in the Kitchen'],
      ['paragraph', `Every family has a voice that lives in the kitchen the way other voices live in concert halls. Unrecorded, unarranged, unattributed, it simply carries. It is the song you know before you know you know it.`],
      ...fin('When the Generations Sing', 0, 3),
    ],
  },
  {
    bookId: 'book-04',
    order: 1,
    title: 'Harmony as Inheritance',
    blocks: [
      ['heading', 'Harmony as Inheritance'],
      ['paragraph', `Harmony is the first inheritance. Before land, before money, before learning, there is the instinct to sing alongside — to find the note that fits and to hold it.`],
      ...fin('When the Generations Sing', 1, 3),
    ],
  },
  {
    bookId: 'book-04',
    order: 2,
    title: 'The Song Outlasts the Singer',
    blocks: [
      ['heading', 'The Song Outlasts the Singer'],
      ['paragraph', `This is the only immortality advertised without fine print. The song outlasts the singer, the way the river outlasts the boat, the way the horizon outlasts the traveller.`],
      ...fin('When the Generations Sing', 2, 3),
    ],
  },
  {
    bookId: 'book-05',
    order: 0,
    title: 'A Century and a Question',
    blocks: [
      ['heading', 'A Century and a Question'],
      ['paragraph', `Every African century begins with the same question, posed at a different volume: who gets to write this one? The answer is usually decided less by the writers than by the grammar of the era — by who is permitted to be the subject of their own sentence.`],
      ...fin('The Weight of a Continent', 0, 3),
    ],
  },
  {
    bookId: 'book-05',
    order: 1,
    title: 'The Grammar of the Era',
    blocks: [
      ['heading', 'The Grammar of the Era'],
      ['paragraph', `Nations, like sentences, are built on grammar. The awkward ones are the most honest: they show the work of their construction, and they take the longest to translate.`],
      ...fin('The Weight of a Continent', 1, 3),
    ],
  },
  {
    bookId: 'book-05',
    order: 2,
    title: 'The Weight We Choose',
    blocks: [
      ['heading', 'The Weight We Choose'],
      ['paragraph', `The weight of a continent is not borne in a day, nor by a single pair of shoulders. It is distributed, unfairly at first, until the next generation finds a better distribution and insists on it.`],
      ...fin('The Weight of a Continent', 2, 3),
    ],
  },
];

export function seedChapters(): Chapter[] {
  const now = new Date().toISOString();
  const chapters: Chapter[] = [];
  for (const spec of chapterSpecs) {
    const blocks: ChapterBlock[] = spec.blocks.map(([type, text]) => ({ type, text }));
    chapters.push({
      id: `${spec.bookId}-ch-${spec.order + 1}`,
      bookId: spec.bookId,
      title: spec.title,
      slug: toSlug(spec.title),
      order: spec.order,
      content: blocks,
      published: true,
      createdAt: now,
      updatedAt: now,
    });
  }
  return chapters;
}

/* ------------------------------------------------------------------ */
/* Settings / coupons                                                  */
/* ------------------------------------------------------------------ */

export const seedSettings: SiteSettings = {
  shopName: 'SNS Books',
  tagline: 'Stories. Lives. Legacies.',
  announcement: null,
  allowRegistration: true,
  basePrices: {
    TZS: 15000,
    USD: 6.5,
    EUR: 6,
    GBP: 5,
  },
  currenciesEnabled: ['TZS', 'USD', 'EUR', 'GBP'],
  defaultCurrency: 'TZS',
  watermarkReaders: true,
  offlineReading: true,
};