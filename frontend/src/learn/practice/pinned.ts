// A player kept in reach while the learner scrolls (listening exercises, dialogues).
import { useEffect, useRef, useState } from 'react';

/**
 * Keeps the player in reach while the learner answers: once its card scrolls
 * under the site header, the card is pinned just below it, in a compact form,
 * at the same place in the column. The slot keeps the card's height, so the
 * questions do not jump.
 */
export function usePinnedPlayer(rowSelector: string) {
  const slot = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLElement>(null);
  const [pin, setPin] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  useEffect(() => {
    let frame = 0, height = 0, rowEnd = 0;
    const update = () => {
      frame = 0;
      const s = slot.current, c = card.current;
      if (!s || !c) return;
      // Where the site header ends (it is sticky at the top).
      const header = Math.max(0, document.querySelector<HTMLElement>('.lp-header')?.getBoundingClientRect().bottom ?? 0);
      const r = s.getBoundingClientRect();
      // Measured in the card's normal form: its height, and where its player row ends.
      if (!c.classList.contains('is-pinned')) {
        height = c.offsetHeight;
        const row = c.querySelector(rowSelector);
        rowEnd = row ? row.getBoundingClientRect().bottom - c.getBoundingClientRect().top : height;
      }
      // Pinned as soon as the player row slides under the header.
      const pinned = height > 0 && r.top + rowEnd < header;
      setPin(old => {
        if (!pinned) return old ? null : old;
        const next = { top: Math.round(header), left: Math.round(r.left), width: Math.round(r.width), height };
        return old && old.top === next.top && old.left === next.left && old.width === next.width && old.height === next.height ? old : next;
      });
    };
    const ask = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', ask, { passive: true });
    window.addEventListener('resize', ask);
    return () => { window.removeEventListener('scroll', ask); window.removeEventListener('resize', ask); if (frame) cancelAnimationFrame(frame); };
  }, [rowSelector]);
  return { slot, card, pin };
}
