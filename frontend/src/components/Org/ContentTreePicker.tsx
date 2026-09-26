import React, { memo, useCallback, useMemo, useState } from 'react';
import { Checkbox, Input, Skeleton, Tooltip } from 'antd';
import {
  AudioOutlined, BookOutlined, CalendarOutlined, ClockCircleOutlined, FolderOutlined, FormOutlined,
  LockOutlined, ReadOutlined, RightOutlined, SearchOutlined, SoundOutlined,
} from '@ant-design/icons';
import { FAMILY_CODE } from '../Admin/examAdminData';
import type { Family } from '../Admin/examAdminData';
import { indexTree } from './contentTreeIndex';
import type { ContentNode, Row } from './contentTreeIndex';
import { useTr } from '../../utils/useTr';
import '../Admin/ExamAdmin.css';

/* ══════════════════════════════════════════
   Exam content picker: the TCF tree (skill → series, or skill → year → month →
   combinaison / partie). Ticking a parent includes everything under it.
   A node with selectable === false (outside what a company may use) can be
   opened to reach what is inside, but not ticked.
══════════════════════════════════════════ */

const CATEGORY_ICON: Record<string, React.ReactNode> = {
  ReadOutlined: <ReadOutlined />, FormOutlined: <FormOutlined />, SoundOutlined: <SoundOutlined />,
  AudioOutlined: <AudioOutlined />, BookOutlined: <BookOutlined />,
};
const iconOf = (row: Row) => {
  const t = row.node.type;
  if (t === 'category') return CATEGORY_ICON[row.node.icon || ''] || <FolderOutlined />;
  if (t.endsWith('_year')) return <CalendarOutlined />;
  if (t.endsWith('_month')) return <ClockCircleOutlined />;
  return <BookOutlined />;
};

const TreeRow = memo(function TreeRow({ row, checked, included, open, locked, onToggle, onExpand, typeLabel, includedLabel, lockedLabel }: {
  row: Row; checked: boolean; included: boolean; open: boolean; locked: boolean;
  onToggle: (key: string, on: boolean) => void; onExpand: (key: string) => void;
  typeLabel: string; includedLabel: string; lockedLabel: string;
}) {
  const has = row.childKeys.length > 0;
  return (
    <div className={`ea-row fam-${row.family}${checked ? ' is-checked' : ''}${included ? ' is-included' : ''}${row.depth === 0 ? ' is-root' : ''}`}
      style={{ paddingLeft: 8 + row.depth * 22 }} role="treeitem" aria-selected={checked || included} aria-expanded={has ? open : undefined}>
      <button type="button" className={`ea-caret${open ? ' is-open' : ''}`} onClick={() => has && onExpand(row.key)}
        tabIndex={has ? 0 : -1} aria-hidden={!has} aria-label={row.label}>
        {has && <RightOutlined />}
      </button>
      {locked
        ? <Tooltip title={lockedLabel}><LockOutlined style={{ width: 16, color: 'var(--x-subtle)' }} /></Tooltip>
        : <Checkbox checked={checked || included} disabled={included} onChange={e => onToggle(row.key, e.target.checked)} aria-label={row.label} />}
      <span className="ea-row-ic">{iconOf(row)}</span>
      <span className="ea-row-text" onClick={() => (has ? onExpand(row.key) : !included && !locked && onToggle(row.key, !checked))}>
        <strong>{row.label}</strong>
      </span>
      <span className="ea-type">{included ? includedLabel : typeLabel}</span>
    </div>
  );
});

const ContentTreePicker: React.FC<{
  tree: ContentNode[] | null;
  value: string[];
  onChange: (keys: string[]) => void;
  loading?: boolean;
  height?: number | string;
  /** The administrator's console, which stays in English. */
  english?: boolean;
}> = ({ tree, value, onChange, loading = false, height = 360, english = false }) => {
  const { tr: inLanguage } = useTr();
  const tr = english ? (en: string) => en : inLanguage;
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState('');
  const [family, setFamily] = useState<Family | 'all'>('all');

  const index = useMemo(() => indexTree(tree || []), [tree]);
  const selectedSet = useMemo(() => new Set(value), [value]);
  const includedSet = useMemo(() => {
    const out = new Set<string>();
    const add = (k: string) => index.map.get(k)?.childKeys.forEach(c => { out.add(c); add(c); });
    value.forEach(add);
    return out;
  }, [value, index]);

  const TYPE: Record<string, string> = {
    category: tr('Skill', 'Compétence'), ce_series: tr('Series', 'Série'), co_series: tr('Series', 'Série'),
    ee_year: tr('Year', 'Année'), ee_month: tr('Month', 'Mois'), ee_combinaison: 'Combinaison',
    eo_year: tr('Year', 'Année'), eo_month: tr('Month', 'Mois'), eo_partie: 'Partie',
  };

  const onToggle = useCallback((key: string, on: boolean) => {
    if (!on) { onChange(value.filter(k => k !== key)); return; }
    // A parent covers its children: drop any selected descendant.
    const desc = new Set<string>();
    const add = (k: string) => index.map.get(k)?.childKeys.forEach(c => { desc.add(c); add(c); });
    add(key);
    onChange([...value.filter(k => !desc.has(k) && k !== key), key]);
  }, [index, value, onChange]);

  const onExpand = useCallback((key: string) => {
    setExpanded(prev => { const n = new Set(prev); if (n.has(key)) n.delete(key); else n.add(key); return n; });
  }, []);

  const q = query.trim().toLowerCase();
  const rows = useMemo(() => {
    const out: Row[] = [];
    let allowed: Set<string> | null = null;
    if (q) {
      allowed = new Set();
      for (const r of index.map.values()) {
        if (!r.label.toLowerCase().includes(q)) continue;
        let k: string | null = r.key;
        while (k && !allowed.has(k)) { allowed.add(k); k = index.map.get(k)?.parent ?? null; }
      }
    }
    const visit = (k: string) => {
      if (allowed && !allowed.has(k)) return;
      const r = index.map.get(k)!;
      out.push(r);
      const isOpen = allowed ? r.childKeys.some(c => allowed!.has(c)) : expanded.has(k);
      if (isOpen) r.childKeys.forEach(visit);
    };
    index.roots.filter(k => family === 'all' || index.map.get(k)!.family === family).forEach(visit);
    return out;
  }, [index, expanded, q, family]);

  const roots = index.roots.map(k => index.map.get(k)!);
  return (
    <div className="og-tree">
      <div className="ea-tools">
        <Input allowClear prefix={<SearchOutlined />} placeholder={tr('Search series, years, months…', 'Rechercher une série, une année, un mois…')} value={query} onChange={e => setQuery(e.target.value)} />
        <div className="ea-fams" role="tablist">
          <button type="button" className={family === 'all' ? 'is-on' : ''} onClick={() => setFamily('all')}>{tr('All', 'Tout')}</button>
          {roots.map(r => (
            <Tooltip key={r.key} title={r.label}>
              <button type="button" className={`fam-${r.family}${family === r.family ? ' is-on' : ''}`} onClick={() => setFamily(family === r.family ? 'all' : r.family)}>
                {FAMILY_CODE[r.family]}
              </button>
            </Tooltip>
          ))}
        </div>
      </div>
      <div className="ea-tree" role="tree" style={{ maxHeight: height, minHeight: 200 }}>
        {loading && !tree ? (
          <div style={{ padding: 12 }}><Skeleton active title={false} paragraph={{ rows: 6 }} /></div>
        ) : rows.length === 0 ? (
          <div className="og-empty"><SearchOutlined /><strong>{q ? tr('Nothing matches your search', 'Aucun résultat') : tr('No content', 'Aucun contenu')}</strong></div>
        ) : rows.map(row => (
          <TreeRow key={row.key} row={row} checked={selectedSet.has(row.key)} included={includedSet.has(row.key)}
            open={q ? true : expanded.has(row.key)} locked={row.node.selectable === false}
            onToggle={onToggle} onExpand={onExpand}
            typeLabel={TYPE[row.node.type] || row.node.type} includedLabel={tr('Included', 'Inclus')}
            lockedLabel={tr('Open it to choose what is inside', 'Ouvrez pour choisir le contenu autorisé')} />
        ))}
      </div>
    </div>
  );
};

export default ContentTreePicker;
