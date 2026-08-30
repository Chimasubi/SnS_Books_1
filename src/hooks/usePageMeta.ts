import { useEffect, useState } from 'react';

/**
 * Lightweight per-route SEO helper: sets document title, description and
 * Open Graph meta so public pages are indexable. Reader/account pages can
 * opt out via robots.
 */
interface MetaOptions {
  title?: string;
  description?: string;
  noindex?: boolean;
}

export function usePageMeta(options: MetaOptions = {}): void {
  const { title, description, noindex } = options;
  useEffect(() => {
    const base = 'SNS Books';
    document.title = title ? `${title} · ${base}` : base;
    if (description) {
      setMeta('description', description);
      setMeta('og:description', description);
    }
    if (title) {
      setMeta('og:title', title);
    }
    setMeta('og:site_name', base);
    setMeta('og:type', 'website');
    if (noindex) {
      setMeta('robots', 'noindex');
    } else {
      document.querySelector('meta[name="robots"]')?.remove();
    }
  }, [title, description, noindex]);
}

export function useLocalStorage<T>(
  key: string,
  initial: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  const setter = (value: T | ((prev: T) => T)) => {
    setState((prev) => {
      const next = typeof value === 'function' ? (value as (p: T) => T)(prev) : value;
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        /* storage unavailable */
      }
      return next;
    });
  };

  return [state, setter];
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query]);
  return matches;
}

function setMeta(prop: string, content: string): void {
  const attr = prop.startsWith('og:') ? 'property' : 'name';
  let meta = document.querySelector(`meta[${attr}="${prop}"]`) as HTMLMetaElement | null;
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attr, prop);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
}