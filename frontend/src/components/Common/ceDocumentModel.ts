/* ══════════════════════════════════════════
   A reading document (Compréhension écrite), stored as light markup:
     **Title**            a bold line
     | a | b |            a table row ("| --- |" after a row makes it the header;
                          a "<" cell merges into the cell on its left)
     - item               a list item
     [image] / [image N]  where the document's image sits
   Anything else is text; line breaks are kept. Plain text renders as before.
══════════════════════════════════════════ */

export type Cell = { text: string; span: number };
export type Block =
  | { kind: 'text'; lines: string[] }
  | { kind: 'table'; header: Cell[] | null; rows: Cell[][] }
  | { kind: 'list'; items: string[] }
  | { kind: 'image'; n: number };

const IMAGE_LINE = /^\[image(?:\s+(\d+))?\]$/i;
const TABLE_LINE = /^\|.*\|$/;
const SEPARATOR = /^\|(?:\s*:?-{3,}:?\s*\|)+$/;

const cellsOf = (line: string): Cell[] => {
  const parts = line.trim().slice(1, -1).split('|').map(p => p.trim());
  const cells: Cell[] = [];
  for (const part of parts) {
    if (part === '<' && cells.length) cells[cells.length - 1].span += 1;
    else cells.push({ text: part, span: 1 });
  }
  return cells;
};

export function parseCeDocument(source: string): Block[] {
  const blocks: Block[] = [];
  const lines = String(source || '').replace(/\r\n?/g, '\n').split('\n');
  let text: string[] = [];
  const flushText = () => {
    while (text.length && !text[text.length - 1].trim()) text.pop();
    if (text.length) blocks.push({ kind: 'text', lines: text });
    text = [];
  };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (TABLE_LINE.test(line) && !SEPARATOR.test(line)) {
      flushText();
      const rows: Cell[][] = [];
      let header: Cell[] | null = null;
      while (i < lines.length && TABLE_LINE.test(lines[i].trim())) {
        const row = lines[i].trim();
        if (SEPARATOR.test(row)) { if (rows.length === 1 && !header) header = rows.pop() || null; }
        else rows.push(cellsOf(row));
        i++;
      }
      i--;
      blocks.push({ kind: 'table', header, rows });
      continue;
    }
    if (/^[-•]\s+/.test(line)) {
      flushText();
      const items: string[] = [];
      while (i < lines.length && /^[-•]\s+/.test(lines[i].trim())) { items.push(lines[i].trim().replace(/^[-•]\s+/, '')); i++; }
      i--;
      blocks.push({ kind: 'list', items });
      continue;
    }
    const image = line.match(IMAGE_LINE);
    if (image) { flushText(); blocks.push({ kind: 'image', n: Number(image[1] || 1) }); continue; }
    if (!line && !text.length) continue;
    text.push(lines[i]);
  }
  flushText();
  return blocks;
}

/** Plain text of a document (for search and summaries). */
export const ceDocumentPlain = (source: string) =>
  String(source || '')
    .split('\n')
    .filter(l => !IMAGE_LINE.test(l.trim()) && !SEPARATOR.test(l.trim()))
    .map(l => l.replace(/\*\*/g, '').replace(/^\|\s*|\s*\|$/g, '').replace(/\s*\|\s*/g, ' · ').replace(/\s*·\s*<(?=\s|$)/g, ''))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

/** Whether the document says where its image goes. */
export const ceDocumentHasImageSlot = (source: string) =>
  String(source || '').split('\n').some(l => IMAGE_LINE.test(l.trim()));
