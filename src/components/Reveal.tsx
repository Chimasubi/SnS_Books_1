import { useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from 'react';

interface RevealProps {
  as?: ElementType;
  children: ReactNode;
  delay?: number;
  variant?: 'up' | 'scale' | 'left' | 'right';
  className?: string;
  style?: CSSProperties;
}

export function Reveal({
  as: Tag = 'div',
  children,
  delay = 0,
  variant = 'up',
  className = '',
  style,
}: RevealProps) {
  const ref = useRef<any>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -48px 0px' },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  const mergedStyle: CSSProperties = {
    ...style,
    ...(delay ? { '--reveal-delay': `${delay}ms` } as CSSProperties : {}),
  };

  return (
    <Tag
      ref={ref}
      className={`reveal ${variant !== 'up' ? `reveal-${variant}` : ''} ${shown ? 'reveal-revealed' : ''} ${className}`}
      data-reveal={variant !== 'up' ? variant : undefined}
      style={mergedStyle}
    >
      {children}
    </Tag>
  );
}