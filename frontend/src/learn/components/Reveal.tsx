// The motion layer of the learning space: content that fades up as it scrolls
// into view, and numbers that count up. Both respect « reduced motion », and
// neither ever hides pre-rendered content: what is on screen at load stays put,
// only what is further down the page waits for the scroll.
import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from 'react';

const reducedMotion = () =>
  typeof window === 'undefined' || !('IntersectionObserver' in window) || !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

type RevealProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  /** Milliseconds before this item starts (to stagger a list). */
  delay?: number;
} & Record<string, unknown>;

export function Reveal({ as: Tag = 'div', children, className = '', delay = 0, ...rest }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion()) return;
    // Already visible when the page opens: no animation, no flash.
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;
    el.classList.add('is-armed');
    const io = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) {
        el.classList.add('is-in');
        io.disconnect();
      }
    }, { rootMargin: '0px 0px -6% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const style = delay ? ({ '--rv-delay': `${delay}ms` } as CSSProperties) : undefined;
  return <Tag ref={ref} className={`rv ${className}`.trim()} style={style} {...rest}>{children}</Tag>;
}

/** A number that counts up from zero the first time it scrolls into view. */
export function CountUp({ value, duration = 1300, suffix = '' }: { value: number; duration?: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion()) return;
    let raf = 0;
    const io = new IntersectionObserver(entries => {
      if (!entries.some(e => e.isIntersecting)) return;
      io.disconnect();
      let start = -1;
      const tick = (now: number) => {
        // The first frame sets the clock (a frame time can precede performance.now()).
        if (start < 0) start = now;
        const k = Math.min(1, Math.max(0, (now - start) / duration));
        el.textContent = `${Math.round(value * (1 - Math.pow(1 - k, 3)))}${suffix}`;
        if (k < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [value, duration, suffix]);
  return <span ref={ref}>{value}{suffix}</span>;
}
