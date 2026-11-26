import React, { useRef } from 'react';
import { Button, Input, Tooltip } from 'antd';
import { BoldOutlined, ItalicOutlined, UnorderedListOutlined } from '@ant-design/icons';
import type { TextAreaRef } from 'antd/es/input/TextArea';
import './PortalBrandingEditor.css';

interface HeroRichEditorProps {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  lang?: 'en' | 'fr';
  maxLength?: number;
  rows?: number;
  placeholder?: string;
}

export const HeroRichEditor: React.FC<HeroRichEditorProps> = ({
  value,
  onChange,
  disabled = false,
  lang = 'en',
  maxLength = 1000,
  rows = 4,
  placeholder,
}) => {
  const ref = useRef<TextAreaRef | null>(null);
  const tr = (en: string, fr: string) => (lang === 'fr' ? fr : en);

  const getEl = () => ref.current?.resizableTextArea?.textArea || null;

  const updateWithSelection = (next: string, selStart: number, selEnd: number) => {
    onChange(next.slice(0, maxLength));
    window.requestAnimationFrame(() => {
      const el = getEl();
      if (!el) return;
      el.focus();
      el.setSelectionRange(Math.min(selStart, maxLength), Math.min(selEnd, maxLength));
    });
  };

  const wrapSelection = (marker: string, fallback: string) => {
    if (disabled) return;
    const el = getEl();
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    const selected = value.slice(start, end);
    const inner = selected || fallback;
    const inserted = `${marker}${inner}${marker}`;
    const next = `${value.slice(0, start)}${inserted}${value.slice(end)}`;
    updateWithSelection(next, start + marker.length, start + marker.length + inner.length);
  };

  const prefixLines = (prefix: string, fallback: string) => {
    if (disabled) return;
    const el = getEl();
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    const lineStart = value.lastIndexOf('\n', Math.max(0, start - 1)) + 1;
    const nextNewline = value.indexOf('\n', end);
    const lineEnd = nextNewline === -1 ? value.length : nextNewline;
    const slice = value.slice(lineStart, lineEnd);

    if (!slice.trim()) {
      const sep = value.length > 0 && !value.endsWith('\n') ? '\n' : '';
      const inserted = `${sep}${prefix}${fallback}`;
      const next = `${value.slice(0, start)}${inserted}${value.slice(end)}`;
      const s = start + sep.length + prefix.length;
      updateWithSelection(next, s, s + fallback.length);
      return;
    }

    const updatedSlice = slice
      .split('\n')
      .map(l => (l.trim() ? (l.startsWith(prefix) ? l : `${prefix}${l.replace(/^(?:[-*•]|#{1,3})\s+/, '')}`) : l))
      .join('\n');
    const next = `${value.slice(0, lineStart)}${updatedSlice}${value.slice(lineEnd)}`;
    updateWithSelection(next, lineStart, lineStart + updatedSlice.length);
  };

  const insertSample = () => {
    if (disabled) return;
    const sample = lang === 'fr'
      ? '## Votre espace de formation\n- Examens blancs **TCF Canada** en conditions réelles\n- Corrections détaillées par **IA** à l’écrit et à l’oral\n- Suivi continu de votre *niveau NCLC*'
      : '## Your training workspace\n- Full **TCF Canada** mock exams in official format\n- Instant **AI feedback** for writing and speaking\n- Track your *NCLC level* every step of the way';
    onChange(sample);
  };

  return (
    <div className="pbe-rich-editor">
      <div className="pbe-rich-bar">
        <Tooltip title={tr('Bold (**text**)', 'Gras (**texte**)')}>
          <Button
            size="small"
            type="text"
            icon={<BoldOutlined />}
            disabled={disabled}
            onClick={() => wrapSelection('**', tr('bold text', 'texte en gras'))}
            aria-label={tr('Bold', 'Gras')}
          />
        </Tooltip>
        <Tooltip title={tr('Italic (*text*)', 'Italique (*texte*)')}>
          <Button
            size="small"
            type="text"
            icon={<ItalicOutlined />}
            disabled={disabled}
            onClick={() => wrapSelection('*', tr('italic text', 'texte en italique'))}
            aria-label={tr('Italic', 'Italique')}
          />
        </Tooltip>
        <Tooltip title={tr('Bullet list (- item)', 'Liste à puces (- élément)')}>
          <Button
            size="small"
            type="text"
            icon={<UnorderedListOutlined />}
            disabled={disabled}
            onClick={() => prefixLines('- ', tr('Key point', 'Point clé'))}
            aria-label={tr('Bullet list', 'Liste à puces')}
          />
        </Tooltip>
        <Tooltip title={tr('Subheading (## Title)', 'Sous-titre (## Titre)')}>
          <Button
            size="small"
            type="text"
            disabled={disabled}
            onClick={() => prefixLines('## ', tr('Section heading', 'Titre de section'))}
            style={{ fontWeight: 800, fontSize: 12, paddingInline: 7 }}
          >
            H
          </Button>
        </Tooltip>
        <span style={{ flex: 1 }} />
        {!value.trim() && (
          <Button size="small" type="link" disabled={disabled} onClick={insertSample} style={{ paddingInline: 4, fontSize: 12 }}>
            {tr('Insert sample', 'Insérer un exemple')}
          </Button>
        )}
        <span className="pbe-rich-count">{value.length}/{maxLength}</span>
      </div>
      <Input.TextArea
        ref={ref}
        value={value}
        onChange={e => onChange(e.target.value)}
        maxLength={maxLength}
        autoSize={{ minRows: rows, maxRows: 8 }}
        disabled={disabled}
        placeholder={
          placeholder ||
          tr(
            'Add formatted text or a bullet list shown on the login hero.\nExample:\n- **Official format** mock tests\n- Personalized progress tracking',
            'Ajoutez un texte mis en forme ou une liste affichée sur la page de connexion.\nExemple :\n- Examens au **format officiel**\n- Suivi personnalisé de votre progression'
          )
        }
      />
    </div>
  );
};

export default HeroRichEditor;
