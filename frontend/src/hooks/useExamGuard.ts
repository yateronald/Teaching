import { useEffect, useRef } from 'react';
import './examGuard.css';

/**
 * Exam content protection.
 *
 * While an exam screen (or its review) is open, questions, documents and
 * prompts cannot be selected, copied, cut, dragged out, opened in the context
 * menu, printed or saved with Ctrl/⌘ + P / S. Answer fields keep working
 * normally (each exam decides separately whether pasting is allowed).
 *
 * A browser can never stop a photo or screenshot of the screen; this removes
 * every easy way of lifting the text.
 */
let guards = 0;

const EDITABLE = 'input, textarea, select, [contenteditable=""], [contenteditable="true"]';
const inEditable = (t: EventTarget | null) => t instanceof Element && !!t.closest(EDITABLE);
const selectionInEditable = () => inEditable(document.activeElement) && !!(document.activeElement as HTMLInputElement).value;

export default function useExamGuard(active = true, onBlocked?: (text: string) => void) {
  const notify = useRef(onBlocked);
  notify.current = onBlocked;

  useEffect(() => {
    if (!active) return;
    guards += 1;
    document.documentElement.classList.add('exam-guard');
    window.getSelection()?.removeAllRanges();

    let lastToast = 0;
    const warn = () => {
      const now = Date.now();
      if (now - lastToast < 2500) return;
      lastToast = now;
      notify.current?.('Copying exam content is disabled.');
    };
    const block = (e: Event) => { e.preventDefault(); e.stopPropagation(); };

    const onCopyLike = (e: ClipboardEvent) => {
      if (inEditable(e.target) && selectionInEditable()) return; // the student's own answer
      block(e);
      warn();
    };
    const onSelectStart = (e: Event) => { if (!inEditable(e.target)) e.preventDefault(); };
    const onContextMenu = (e: MouseEvent) => { if (!inEditable(e.target)) block(e); };
    const onDragStart = (e: DragEvent) => { if (!inEditable(e.target)) block(e); };
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      const k = e.key.toLowerCase();
      if (k === 'p' || k === 's') { block(e); warn(); return; }
      if ((k === 'a' || k === 'c' || k === 'x') && !inEditable(e.target)) { block(e); if (k !== 'a') warn(); }
    };

    document.addEventListener('copy', onCopyLike, true);
    document.addEventListener('cut', onCopyLike, true);
    document.addEventListener('selectstart', onSelectStart, true);
    document.addEventListener('contextmenu', onContextMenu, true);
    document.addEventListener('dragstart', onDragStart, true);
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('copy', onCopyLike, true);
      document.removeEventListener('cut', onCopyLike, true);
      document.removeEventListener('selectstart', onSelectStart, true);
      document.removeEventListener('contextmenu', onContextMenu, true);
      document.removeEventListener('dragstart', onDragStart, true);
      document.removeEventListener('keydown', onKey, true);
      guards = Math.max(0, guards - 1);
      if (guards === 0) document.documentElement.classList.remove('exam-guard');
    };
  }, [active]);
}
