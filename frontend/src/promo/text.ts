// The words of a campaign in the language of the page, the label of its
// button, and the clock of its deadline: shared by every placement.
import { useEffect, useState } from 'react';
import { COPY } from './copy';
import { timeLeft, type Lang, type Promotion, type TimeLeft } from './model';

/** French punctuation never starts a line: the space before : ; ! ? does not break. */
const tidy = (s: string | null) => (s ? s.replace(/ ([:;!?»])/g, ' $1').replace(/« /g, '« ') : s);

/** The words of a campaign in the language of the page. */
export function wordsOf(p: Promotion, lang: Lang) {
  const w = p.text[lang];
  return lang === 'fr' ? { ...w, title: tidy(w.title), tagline: tidy(w.tagline), highlights: w.highlights.map(h => tidy(h)!) } : w;
}

/** What the button of a campaign says. */
export function ctaLabel(p: Promotion, lang: Lang): string {
  const c = COPY[lang];
  if (p.full && p.registration.mode === 'form') return c.ctaFull;
  return wordsOf(p, lang).cta || c.cta[p.kind];
}

/** Time left, re-read every second on the last day and every half minute before. */
export function useTimeLeft(endsAt: string | null): TimeLeft | null {
  const [left, setLeft] = useState<TimeLeft | null>(() => timeLeft(endsAt));
  useEffect(() => {
    setLeft(timeLeft(endsAt));
    if (!endsAt) return;
    let timer = 0;
    const tick = () => {
      const now = timeLeft(endsAt);
      setLeft(now);
      if (now) timer = window.setTimeout(tick, now.days >= 1 ? 30_000 : 1000);
    };
    timer = window.setTimeout(tick, 1000);
    return () => window.clearTimeout(timer);
  }, [endsAt]);
  return left;
}

