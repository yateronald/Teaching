// The text of an explanation card (the box with the coloured bar on the left).
// It is written as one paragraph and often lists phrases inside a sentence,
// like "Drinks: **un café crème, un thé à la menthe, un chocolat chaud**."
// Read as a block, such lists are hard to scan and their highlights break
// across lines. Here each such sentence becomes a row: the label, then one
// chip per phrase. Every other sentence stays prose, exactly as written.
import React from 'react';

type Item = { kind: 'chip' | 'word'; text: string };
type Row = { label: string; items: Item[] };
type Block = { kind: 'prose'; text: string } | { kind: 'rows'; rows: Row[] };

const BOLD = /\*\*[^*]+\*\*/g;
// A sentence end (possibly closing a bold phrase), spaces, then a capital.
// No look-behind: older Safari versions do not support it.
const BOUNDARY = /([.!?…](?:\*\*)?)(\s+)(?=(?:\*\*)?[A-ZÀ-ÖØ-Þ«"])/g;
// "Pastries & bread: …", "Pain et viennoiseries : …"
const LABEL = /^([A-ZÀ-ÖØ-Þ][^.:*!?\n]{0,38}?)\s?:\s+([\s\S]+)$/;

/** Splits a paragraph into sentences, never inside a **bold** phrase. */
function sentences(text: string): string[] {
  const bold: [number, number][] = [];
  for (const m of text.matchAll(BOLD)) bold.push([m.index ?? 0, (m.index ?? 0) + m[0].length]);
  const inside = (i: number) => bold.some(([a, b]) => i > a && i < b);
  const out: string[] = [];
  let start = 0;
  for (const m of text.matchAll(BOUNDARY)) {
    const cut = (m.index ?? 0) + m[1].length;
    if (inside(cut)) continue;
    out.push(text.slice(start, cut));
    start = cut + m[2].length;
  }
  out.push(text.slice(start));
  return out.filter(s => s.trim());
}

/**
 * One bold group → its phrases. " · " always separates phrases. Commas do only
 * in a plain list ("un croissant, un pain au chocolat, une tartelette"): 3 or
 * more short items, and no sentence inside (! ? ; or a full stop) ("On peut se tutoyer, si tu veux…
 * euh, si vous voulez !" stays one phrase).
 */
function phrases(group: string): string[] {
  const out: string[] = [];
  for (const piece of group.split(/\s+·\s+/).map(p => p.trim()).filter(Boolean)) {
    const parts = piece.split(/,\s+/).map(p => p.trim());
    const sentence = /[!?;]|\.\s/.test(piece);
    if (!sentence && parts.length >= 3 && parts.every(p => p.split(/\s+/).length <= 5)) {
      parts[parts.length - 1] = parts[parts.length - 1].replace(/[.;]$/, '');
      out.push(...parts);
    } else {
      out.push(piece);
    }
  }
  return out;
}

// The only plain words a row may keep between its phrases.
const CONNECTORS = new Set(['or', 'and', 'then', 'vs', 'versus', 'ou', 'et', 'puis', 'ni']);

/** A sentence made of a short label and only bold phrases (and connectors) becomes a row. */
function asRow(sentence: string): Row | null {
  const m = sentence.trim().match(LABEL);
  if (!m) return null;
  const label = m[1].trim();
  const rest = m[2].trim();
  if (label.split(/\s+/).length > 5 || !rest.includes('**')) return null;
  const items: Item[] = [];
  for (const part of rest.split(/(\*\*[^*]+\*\*)/g)) {
    if (!part) continue;
    if (part.startsWith('**')) {
      for (const p of phrases(part.slice(2, -2))) items.push({ kind: 'chip', text: p });
      continue;
    }
    const word = part.replace(/[^\p{L}\p{N}'’\s-]+/gu, ' ').trim();
    if (!word) continue;                                   // commas, full stops
    if (!CONNECTORS.has(word.toLowerCase())) return null;  // real prose: keep it as written
    items.push({ kind: 'word', text: word });
  }
  return { label, items };
}

export function conceptBlocks(paragraph: string): Block[] {
  const out: Block[] = [];
  for (const s of sentences(paragraph)) {
    const row = asRow(s);
    const last = out[out.length - 1];
    if (row) {
      if (last?.kind === 'rows') last.rows.push(row);
      else out.push({ kind: 'rows', rows: [row] });
    } else if (last?.kind === 'prose') {
      last.text += ` ${s.trim()}`;
    } else {
      out.push({ kind: 'prose', text: s.trim() });
    }
  }
  return out;
}

/** Inline **bold** and __highlight__; short highlights never break across lines. */
function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|__[^_]+__)/g).filter(Boolean);
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith('**')) {
          const t = p.slice(2, -2);
          return <strong key={i} className={t.length <= 28 ? 'is-short' : undefined}>{t}</strong>;
        }
        if (p.startsWith('__')) return <mark key={i} className="lx-hl">{p.slice(2, -2)}</mark>;
        return <React.Fragment key={i}>{p}</React.Fragment>;
      })}
    </>
  );
}

export function ConceptBody({ text }: { text: string }) {
  let rowIndex = 0;
  return (
    <div className="lx-concept-body">
      {text.split(/\n\s*\n/).map((paragraph, i) =>
        conceptBlocks(paragraph).map((b, j) =>
          b.kind === 'prose' ? (
            <p key={`${i}.${j}`}><Inline text={b.text} /></p>
          ) : (
            <dl key={`${i}.${j}`} className="lx-cb-rows">
              {b.rows.map((r, k) => (
                <div key={k} className="lx-cb-row" style={{ '--i': rowIndex++ } as React.CSSProperties}>
                  <dt>{r.label}</dt>
                  <dd>
                    {r.items.map((it, n) =>
                      it.kind === 'chip'
                        ? <span key={n} className={`lx-cb-chip${it.text.length > 34 ? ' is-long' : ''}`} lang="fr">{it.text}</span>
                        : <span key={n} className="lx-cb-word">{it.text}</span>,
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          ),
        ),
      )}
    </div>
  );
}
