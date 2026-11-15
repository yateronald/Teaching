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

/** Time left, re-read every second (the countdowns show the seconds). Each
 *  tick lands on the turn of the second, so every countdown of the page moves
 *  together; a hidden tab is not woken up for nothing. */
export function useTimeLeft(endsAt: string | null): TimeLeft | null {
  const [left, setLeft] = useState<TimeLeft | null>(() => timeLeft(endsAt));
  useEffect(() => {
    setLeft(timeLeft(endsAt));
    if (!endsAt) return;
    let timer = 0;
    const next = () => 1000 - (Date.now() % 1000) + 5;
    const tick = () => {
      const now = timeLeft(endsAt);
      setLeft(now);
      if (now) timer = window.setTimeout(tick, document.hidden ? 15_000 : next());
    };
    // Back on the tab: the right time at once.
    const onShow = () => { if (!document.hidden) { window.clearTimeout(timer); tick(); } };
    timer = window.setTimeout(tick, next());
    document.addEventListener('visibilitychange', onShow);
    return () => { window.clearTimeout(timer); document.removeEventListener('visibilitychange', onShow); };
  }, [endsAt]);
  return left;
}

