import React from 'react';
import { parseCeDocument } from './ceDocumentModel';
import './CeDocument.css';

/* Renders a reading document stored as markup: see ceDocumentModel for the format. */

const Inline: React.FC<{ text: string }> = ({ text }) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return <>{parts.map((p, i) => (/^\*\*[^*]+\*\*$/.test(p) ? <strong key={i}>{p.slice(2, -2)}</strong> : <React.Fragment key={i}>{p}</React.Fragment>))}</>;
};

interface Props {
  text: string;
  /** Renders image N where the document places it. */
  renderImage?: (n: number) => React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const CeDocument: React.FC<Props> = ({ text, renderImage, className, style }) => (
  <div className={`cedoc${className ? ` ${className}` : ''}`} style={style}>
    {parseCeDocument(text).map((b, i) => {
      if (b.kind === 'table') {
        return (
          <div key={i} className="cedoc-table-wrap">
            <table className="cedoc-table">
              {b.header && (
                <thead><tr>{b.header.map((c, j) => <th key={j} colSpan={c.span}><Inline text={c.text} /></th>)}</tr></thead>
              )}
              <tbody>
                {b.rows.map((row, r) => (
                  <tr key={r}>{row.map((c, j) => <td key={j} colSpan={c.span}><Inline text={c.text} /></td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      if (b.kind === 'list') return <ul key={i} className="cedoc-list">{b.items.map((t, j) => <li key={j}><Inline text={t} /></li>)}</ul>;
      if (b.kind === 'image') return renderImage ? <div key={i} className="cedoc-image">{renderImage(b.n)}</div> : null;
      return (
        <p key={i} className="cedoc-text">
          {b.lines.map((line, j) => {
            const title = /^\*\*[^*]+\*\*$/.test(line.trim());
            return (
              <React.Fragment key={j}>
                {j > 0 && <br />}
                {title ? <strong className="cedoc-title">{line.trim().slice(2, -2)}</strong> : <Inline text={line} />}
              </React.Fragment>
            );
          })}
        </p>
      );
    })}
  </div>
);

export default CeDocument;
