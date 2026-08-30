import type { Book, BookWithAuthor } from '@/types';
import { AUTHOR_NAME } from '@/config/site';

const PALETTES: Record<string, { bg: string; top: string; accent: string; text: string }> = {
  ember: {
    bg: 'linear-gradient(160deg, #1f0d00 0%, #0d0705 55%, #050505 100%)',
    top: 'rgba(255,106,0,0.16)',
    accent: '#FF6A00',
    text: '#ffffff',
  },
  dawn: {
    bg: 'linear-gradient(160deg, #231807 0%, #0e0c08 55%, #050505 100%)',
    top: 'rgba(255,197,61,0.12)',
    accent: '#FFC53D',
    text: '#ffffff',
  },
  river: {
    bg: 'linear-gradient(160deg, #0a1b1e 0%, #081012 55%, #050505 100%)',
    top: 'rgba(74,190,204,0.14)',
    accent: '#4ABECC',
    text: '#ffffff',
  },
  choir: {
    bg: 'linear-gradient(160deg, #1c0f24 0%, #0d0912 55%, #050505 100%)',
    top: 'rgba(180,120,255,0.14)',
    accent: '#B478FF',
    text: '#ffffff',
  },
  continent: {
    bg: 'linear-gradient(160deg, #0e1a0d 0%, #080d08 55%, #050505 100%)',
    top: 'rgba(120,200,90,0.12)',
    accent: '#78C85A',
    text: '#ffffff',
  },
};

export function getPalette(book: Book) {
  return PALETTES[book.palette] ?? PALETTES.ember;
}

export function CoverArt({ book, className = '' }: { book: Book | BookWithAuthor; className?: string }) {
  const palette = getPalette(book);
  const showDemo = book.demo;
  const authorName = 'author' in book && book.author ? book.author.name : AUTHOR_NAME;

  return (
    <div
      className={`cover ${className}`}
      data-palette={book.palette}
      role="img"
      aria-label={`Cover: ${book.title}`}
    >
      <div className="cover-surface" style={{ background: palette.bg }} />
      <div className="cover-glow" style={{ background: `radial-gradient(circle at 50% 20%, ${palette.top}, transparent 70%)` }} />
      <div className="cover-spine" />
      <div className="cover-band" style={{ borderColor: palette.accent }}>
        <span className="cover-brand">SNS BOOKS</span>
      </div>
      <div className="cover-mid">
        <span className="cover-edition" style={{ color: palette.accent }}>
          {showDemo ? `${book.eduNumber} · DEMO EDITION` : book.eduNumber}
        </span>
        <h3 className="cover-title">{book.title}</h3>
        <p className="cover-subtitle">{book.subtitle}</p>
      </div>
      <div className="cover-foot">
        <span className="cover-rule" style={{ background: palette.accent }} />
        <span className="cover-author">{authorName}</span>
        <span className="cover-mark" aria-hidden="true">
          SNS
        </span>
      </div>
    </div>
  );
}