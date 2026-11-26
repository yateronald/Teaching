import React from 'react';

interface HeroRichContentProps {
  text: string;
  tone?: 'light' | 'dark';
  align?: 'left' | 'center';
}

type Block =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] };

/** Parses lightweight safe formatting (**bold**, *italic*) into React nodes (no HTML injection). */
function renderInline(line: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const tokenRe = /(\*\*[^*\n]+?\*\*|\*[^*\n]+?\*)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let idx = 0;

  while ((match = tokenRe.exec(line)) !== null) {
    if (match.index > last) {
      nodes.push(line.slice(last, match.index));
    }
    const raw = match[0];
    if (raw.startsWith('**') && raw.endsWith('**') && raw.length > 4) {
      nodes.push(<strong key={`${keyPrefix}-b-${idx++}`}>{raw.slice(2, -2)}</strong>);
    } else if (raw.startsWith('*') && raw.endsWith('*') && raw.length > 2) {
      nodes.push(<em key={`${keyPrefix}-i-${idx++}`}>{raw.slice(1, -1)}</em>);
    } else {
      nodes.push(raw);
    }
    last = match.index + raw.length;
  }
  if (last < line.length) {
    nodes.push(line.slice(last));
  }
  return nodes;
}

function parseBlocks(raw: string): Block[] {
  const lines = String(raw || '').replace(/\r\n?/g, '\n').split('\n');
  const blocks: Block[] = [];
  let listBuf: string[] = [];

  const flushList = () => {
    if (listBuf.length > 0) {
      blocks.push({ type: 'list', items: listBuf });
      listBuf = [];
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushList();
      continue;
    }
    if (/^(?:[-*•])\s+/.test(line)) {
      const item = line.replace(/^(?:[-*•])\s+/, '').trim();
      if (item) listBuf.push(item);
      continue;
    }
    flushList();
    if (/^#{1,3}\s+/.test(line)) {
      const heading = line.replace(/^#{1,3}\s+/, '').trim();
      if (heading) blocks.push({ type: 'heading', text: heading });
    } else {
      blocks.push({ type: 'paragraph', text: line });
    }
  }
  flushList();
  return blocks;
}

export const HeroRichContent: React.FC<HeroRichContentProps> = ({
  text,
  tone = 'light',
  align = 'left',
}) => {
  const blocks = parseBlocks(text);
  if (!blocks.length) return null;

  return (
    <div className={`cp-rich cp-rich--${tone} cp-rich--${align}`}>
      {blocks.map((block, i) => {
        if (block.type === 'heading') {
          return (
            <h3 key={`h-${i}`} className="cp-rich-h">
              {renderInline(block.text, `h-${i}`)}
            </h3>
          );
        }
        if (block.type === 'list') {
          return (
            <ul key={`l-${i}`} className="cp-rich-list">
              {block.items.map((item, j) => (
                <li key={`li-${i}-${j}`}>
                  <span className="cp-rich-dot" aria-hidden="true" />
                  <span>{renderInline(item, `li-${i}-${j}`)}</span>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={`p-${i}`} className="cp-rich-p">
            {renderInline(block.text, `p-${i}`)}
          </p>
        );
      })}
    </div>
  );
};

export default HeroRichContent;
