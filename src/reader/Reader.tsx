import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { Chapter, ReaderPrefs, ReaderTheme } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useMediaQuery } from '@/hooks/usePageMeta';
import { AccessDeniedError,
  createBookmark,
  deleteBookmark,
  getChapterRange,
  getMyBookmarks,
  getReaderAccess,
  getReaderPrefs,
  recordProgress,
  recordRead,
  saveReaderPrefs,
  type ReaderAccess,
} from '@/services/reader.service';
import { getProgress, getChapters, computePrice } from '@/lib/store';
import { formatMoney } from '@/lib/format';
import {
  IconArrowLeft,
  IconBookmark,
  IconText,
  IconX,
  IconCheck,
  IconMenu,
  IconLock,
  IconChevronLeft,
  IconChevronRight,
  IconSun,
  IconMoon,
  IconPlus,
  IconMinus,
} from '@/components/icons';

const THEME_META: Record<ReaderTheme, { label: string; icon: React.ReactNode }> = {
  dark: { label: 'Dark', icon: <IconMoon size={15} /> },
  light: { label: 'Light', icon: <IconSun size={15} /> },
  sepia: { label: 'Sepia', icon: <IconText size={15} /> },
};

export function ReaderPage() {
  const { bookId = '', chapterId } = useParams<{ bookId: string; chapterId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [access, setAccess] = useState<ReaderAccess | null>(null);
  const [denied, setDenied] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [prefs, setPrefs] = useState<ReaderPrefs>(() => getReaderPrefs());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [readPct, setReadPct] = useState(0);

  const contentRef = useRef<HTMLDivElement>(null);
  const progressSavedRef = useRef<Record<string, number>>({});
  const isMobile = useMediaQuery('(max-width: 768px)');

  const userId = user?.id ?? null;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setDenied(null);
    setAccess(null);
    (async () => {
      try {
        const targetChapter = chapterId ?? resolveStartChapter(userId, bookId);
        const result = await getReaderAccess(userId, bookId, targetChapter);
        if (cancelled) return;
        setAccess(result);
        recordRead(userId, bookId, 'reader_open');
      } catch (err) {
        if (cancelled) return;
        setDenied(err instanceof AccessDeniedError ? err.message : 'Unable to open the reader.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId, chapterId, user]);

  useEffect(() => {
    saveReaderPrefs(prefs);
    document.documentElement.dataset.theme = `reader-${prefs.theme}`;
    return () => {
      delete document.documentElement.dataset.theme;
    };
  }, [prefs]);

  useEffect(() => {
    if (!access || !user) {
      setBookmarked(false);
      return;
    }
    getMyBookmarks(user.id).then((marks) => {
      setBookmarked(marks.some((m) => m.chapterId === access.chapter.id));
    });
  }, [access, user]);

  usePageMeta({
    title: access ? `${access.chapter.title} · ${access.book.title}` : undefined,
    description: undefined,
    noindex: true,
  });

  /* ---- reading progress -------------------------------------------- */
  const onScroll = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    const pct = max > 0 ? Math.min(100, Math.max(0, (el.scrollTop / max) * 100)) : 100;
    setReadPct(Math.round(pct));

    if (userId && access) {
      const now = Date.now();
      const last = progressSavedRef.current[access.chapter.id] ?? 0;
      if (now - last > 1500 || pct >= 99.5) {
        progressSavedRef.current[access.chapter.id] = now;
        const chapterIndex = access.chapters.findIndex((c) => c.id === access.chapter.id);
        const fraction = chapterIndex >= 0 ? (chapterIndex + pct / 100) / access.chapters.length : pct / 100;
        recordProgress({
          userId,
          bookId: access.book.id,
          chapterId: access.chapter.id,
          position: Math.round(el.scrollTop),
          percentage: Math.min(100, Math.round(fraction * 100)),
        });
        // Cache authorized chapter content for this user (offline reading).
        try {
          const key = `sns.books.offline.${userId}.${access.book.id}.${access.chapter.id}`;
          const cache = JSON.parse(localStorage.getItem(key) ?? '{}');
          cache.content = access.chapter.content;
          cache.cachedAt = new Date().toISOString();
          localStorage.setItem(key, JSON.stringify(cache));
        } catch {
          /* storage full */
        }
        if (pct >= 99.5) recordRead(userId, access.book.id, 'reader_complete');
      }
    }
  }, [userId, access]);

  useEffect(() => {
    if (!access) return;
    const el = contentRef.current;
    if (!el) return;
    progressSavedRef.current = {};
    onScroll();
    const raf = requestAnimationFrame;
    raf(() => onScroll());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [access?.chapter.id]);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    if (max > 0) el.scrollTop = 0;
  }, [access?.chapter.id]);

  /* ---- keyboard navigation ----------------------------------------- */
  useEffect(() => {
    if (!access) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      const range = getChapterRange(access.chapters, access.chapter);
      if (e.key === 'ArrowRight' && range.next) {
        e.preventDefault();
        navigate(`/read/${access.book.id}/${range.next.id}`);
      } else if (e.key === 'ArrowLeft' && range.prev) {
        e.preventDefault();
        navigate(`/read/${access.book.id}/${range.prev.id}`);
      } else if (e.key === 'a' || e.key === 'A') {
        setSettingsOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [access, navigate]);

  /* ---- bookmark toggle --------------------------------------------- */
  const toggleBookmark = useCallback(async () => {
    if (!user || !access) return;
    if (bookmarked) {
      const marks = await getMyBookmarks(user.id);
      const mine = marks.find((m) => m.chapterId === access.chapter.id);
      if (mine) {
        deleteBookmark(user.id, mine.id);
        setBookmarked(false);
        toast('Bookmark removed.', 'info');
      }
    } else {
      createBookmark({
        userId: user.id,
        bookId: access.book.id,
        chapterId: access.chapter.id,
        position: Math.round(contentRef.current?.scrollTop ?? 0),
      });
      setBookmarked(true);
      if (access.sample) toast('Chapter bookmarked. Own the book to keep every chapter.', 'info');
      else toast('Bookmarked.', 'success');
    }
  }, [access, bookmarked, toast, user]);

  /* ---- render states -------------------------------------------------- */
  if (loading) {
    return (
      <div className="reader" data-theme={prefs.theme}>
        <div className="reader-top">
          <button className="reader-reader-btn" onClick={() => navigate(-1)}>
            <IconArrowLeft size={16} /> Back
          </button>
          <span className="muted">Opening chapter…</span>
        </div>
        <div className="reader-main"><div className="skeleton" style={{ height: 300 }} /></div>
      </div>
    );
  }

  if (denied || !access) {
    return (
      <div className="reader" data-theme={prefs.theme}>
        <div className="reader-top">
          <button className="reader-reader-btn" onClick={() => navigate(-1)}>
            <IconArrowLeft size={16} /> Back
          </button>
        </div>
        <div className="reader-blocked">
          <div className="reader-blocked-card">
            <span className="reader-locked-icon"><IconLock size={26} /></span>
            <h2>This chapter is part of the complete book.</h2>
            <p className="muted" style={{ lineHeight: 'var(--lh-relaxed)' }}>
              {denied}
            </p>
            {bookId && (
              <Link to={`/books/${bookId}`} className="btn btn-primary">
                READ SAMPLE OR BUY
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  const range = getChapterRange(access.chapters, access.chapter);
  const isLast = !range.next;
  const price = computePrice(access.book, access.book.price.currency);

  const fontClass =
    prefs.fontFamily === 'literata'
      ? ''
      : prefs.fontFamily === 'source-serif'
        ? 'source-serif'
        : 'georgia';

  const lineHeight =
    prefs.lineHeight === 'compact' ? 1.5 : prefs.lineHeight === 'comfortable' ? 1.75 : 2;

  return (
    <div className="reader" data-theme={prefs.theme}>
      {/* Top bar */}
      <header className="reader-top">
        <div className="reader-top-left">
          <Link to="/library" className="reader-tool-btn" aria-label="Back to library">
            <IconArrowLeft size={19} />
          </Link>
          {isMobile ? (
            <span className="reader-top-book">{access.book.title}</span>
          ) : (
            <>
              <span className="reader-top-book">SNS BOOKS</span>
              <span style={{ color: 'var(--sns-muted-2)' }}>·</span>
              <span className="reader-top-book">{access.book.title}</span>
            </>
          )}
        </div>
        <div className="reader-top-chapter" style={{ textAlign: 'center' }}>
          <span className="muted" style={{ fontSize: 'var(--fs-xs)', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase' }}>
            {access.book.eduNumber} · {access.chapter.order + 1}/{access.chapters.length}
          </span>
        </div>
        <div className="reader-top-actions">
          <button
            className={`reader-tool-btn ${settingsOpen ? 'reader-tool-btn-active' : ''}`}
            onClick={() => { setSettingsOpen((v) => !v); setTocOpen(false); }}
            aria-label="Reading settings"
            aria-expanded={settingsOpen}
          >
            Aa
          </button>
          <button
            className={`reader-tool-btn ${bookmarked ? 'reader-tool-btn-active' : ''}`}
            onClick={toggleBookmark}
            aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark chapter'}
            aria-pressed={bookmarked}
          >
            <IconBookmark size={18} fill={bookmarked ? 'currentColor' : 'none'} />
          </button>
          <button
            className={`reader-tool-btn ${tocOpen ? 'reader-tool-btn-active' : ''}`}
            onClick={() => { setTocOpen((v) => !v); setSettingsOpen(false); }}
            aria-label="Table of contents"
            aria-expanded={tocOpen}
          >
            <IconMenu size={18} />
          </button>
        </div>
      </header>

      {/* Content */}
      <main
        ref={contentRef}
        className="reader-main"
        onScroll={onScroll}
        style={{ fontSize: prefs.fontSize, lineHeight }}
      >
        <p className="reader-chapter-label">Chapter {String(access.chapter.order + 1).padStart(2, '0')}</p>
        <h1 className="reader-chapter-title">{access.chapter.title}</h1>

        <div className="reader-content" data-font={fontClass}>
          {access.chapter.content.map((block, i) => {
            if (block.type === 'heading') return <h2 key={i}>{block.text}</h2>;
            if (block.type === 'quote') return <blockquote key={i}>{block.text}</blockquote>;
            return <p key={i}>{block.text}</p>;
          })}
        </div>

        {isLast && !access.entitlement && (
          <div className="reader-end-card">
            <span className="reader-locked-icon"><IconLock size={22} /></span>
            <h2>Want to continue Fredrick's story?</h2>
            <p className="muted" style={{ lineHeight: 'var(--lh-relaxed)' }}>
              You've reached the end of the free sample. The complete book unlocks every
              remaining chapter and joins your library instantly.
            </p>
            <Link to={`/checkout/${access.book.id}`} className="btn btn-primary">
              Get the Complete Book · {formatMoney(price.amount, price.currency)}
            </Link>
          </div>
        )}

        {access.watermark && (
          <p className="reader-watermark" aria-hidden="true">
            {access.watermark} · {access.book.title}
          </p>
        )}
      </main>

      {/* Bottom controls */}
      <footer className="reader-bottom">
        <div className="reader-progress-track" style={{ width: `${Math.max(1, readPct)}%` }} aria-hidden="true">
          <div className="reader-progress-fill" style={{ width: '100%' }} />
        </div>
        <div className="reader-bottom-nav">
          {range.prev ? (
            <Link to={`/read/${access.book.id}/${range.prev.id}`} className="reader-reader-btn reader-bottom-prev">
              <IconChevronLeft size={16} /> Pr{isMobile ? '' : 'evious'}
            </Link>
          ) : (
            <span />
          )}
          <span className="reader-progress-label">{readPct}% · Chapter {access.chapter.order + 1}/{access.chapters.length}</span>
          {range.next ? (
            <Link to={`/read/${access.book.id}/${range.next.id}`} className="reader-reader-btn reader-bottom-next">
              Next <IconChevronRight size={16} />
            </Link>
          ) : access.entitlement ? (
            <Link to="/library" className="reader-reader-btn reader-bottom-next">
              Done <IconCheck size={16} />
            </Link>
          ) : (
            <span />
          )}
        </div>
      </footer>

      {/* Drawers */}
      {tocOpen && <div className="reader-drawer-backdrop" onClick={() => setTocOpen(false)} />}
      {tocOpen && (
        <aside className={`reader-drawer ${tocOpen ? 'reader-drawer-open' : ''}`} aria-label="Table of contents">
          <div className="row-between">
            <h3>CONTENTS</h3>
            <button className="reader-tool-btn" onClick={() => setTocOpen(false)} aria-label="Close contents"><IconX size={18} /></button>
          </div>
          <div>
            <p className="muted" style={{ fontSize: 'var(--fs-xs)', marginBottom: 'var(--space-4)' }}>
              {access.book.title} · {access.chapters.length} chapters
            </p>
            <ul className="reader-toc">
              {access.chapters.map((ch: Chapter, i: number) => {
                const free = i < access.book.sampleCount;
                const locked = !free && !access.entitlement;
                return (
                  <li key={ch.id}>
                    {locked ? (
                      <button className="reader-toc-item" onClick={() => navigate(`/checkout/${access.book.id}`)}>
                        <span className="reader-toc-num">{String(i + 1).padStart(2, '0')}</span>
                        <span className="muted">{ch.title}</span>
                        <IconLock size={13} className="muted" />
                      </button>
                    ) : (
                      <button
                        className={`reader-toc-item ${ch.id === access.chapter.id ? 'reader-toc-item-active' : ''}`}
                        onClick={() => { setTocOpen(false); navigate(`/read/${access.book.id}/${ch.id}`); }}
                      >
                        <span className="reader-toc-num">{String(i + 1).padStart(2, '0')}</span>
                        <span>{ch.title}</span>
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>
      )}

      {settingsOpen && <div className="reader-drawer-backdrop" onClick={() => setSettingsOpen(false)} />}
      {settingsOpen && (
        <aside className={`reader-drawer ${settingsOpen ? 'reader-drawer-open' : ''}`} aria-label="Reading settings">
          <div className="row-between">
            <h3>READING SETTINGS</h3>
            <button className="reader-tool-btn" onClick={() => setSettingsOpen(false)} aria-label="Close settings"><IconX size={18} /></button>
          </div>

          <div className="reader-group">
            <p className="reader-group-label">FONT SIZE</p>
            <div className="reader-size-row">
              <button className="reader-size-btn" onClick={() => setPrefs((p) => ({ ...p, fontSize: Math.max(13, p.fontSize - 1) }))} aria-label="Decrease font size">
                <IconMinus size={16} />
              </button>
              <span className="reader-size-value">{prefs.fontSize}px</span>
              <button className="reader-size-btn" onClick={() => setPrefs((p) => ({ ...p, fontSize: Math.min(28, p.fontSize + 1) }))} aria-label="Increase font size">
                <IconPlus size={16} />
              </button>
            </div>
          </div>

          <div className="reader-group">
            <p className="reader-group-label">FONT</p>
            <div className="reader-seg">
              <button className={prefs.fontFamily === 'literata' ? 'on' : ''} onClick={() => setPrefs((p) => ({ ...p, fontFamily: 'literata' }))}>Literata</button>
              <button className={prefs.fontFamily === 'source-serif' ? 'on' : ''} onClick={() => setPrefs((p) => ({ ...p, fontFamily: 'source-serif' }))}>Source Serif</button>
              <button className={prefs.fontFamily === 'georgia' ? 'on' : ''} onClick={() => setPrefs((p) => ({ ...p, fontFamily: 'georgia' }))}>Georgia</button>
            </div>
          </div>

          <div className="reader-group">
            <p className="reader-group-label">LINE HEIGHT</p>
            <div className="reader-seg">
              {(['compact', 'comfortable', 'relaxed'] as const).map((lh) => (
                <button key={lh} className={prefs.lineHeight === lh ? 'on' : ''} onClick={() => setPrefs((p) => ({ ...p, lineHeight: lh }))}>
                  {lh === 'compact' ? 'Compact' : lh === 'comfortable' ? 'Comfortable' : 'Relaxed'}
                </button>
              ))}
            </div>
          </div>

          <div className="reader-group" style={{ borderBottom: 0 }}>
            <p className="reader-group-label">THEME</p>
            <div className="reader-seg">
              {(Object.keys(THEME_META) as ReaderTheme[]).map((theme) => (
                <button key={theme} className={prefs.theme === theme ? 'on' : ''} onClick={() => setPrefs((p) => ({ ...p, theme }))}>
                  {THEME_META[theme].icon} {THEME_META[theme].label}
                </button>
              ))}
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}

/** Resolve a sensible starting chapter when the route omits chapterId. */
function resolveStartChapter(userId: string | null, bookId: string): string {
  const chapters = getChapters(bookId, true);
  if (userId) {
    const progress = getProgress(userId, bookId);
    if (progress && chapters.some((c) => c.id === progress.chapterId)) {
      return progress.chapterId;
    }
  }
  return chapters[0]?.id ?? '';
}