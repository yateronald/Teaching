import React from 'react';
import { Button, Dropdown, Input, Modal, Skeleton, Tooltip, message } from 'antd';
import {
  ArrowLeftOutlined, AudioOutlined, CalendarOutlined, CheckOutlined, ClockCircleOutlined, DeleteOutlined,
  EditOutlined, FolderOpenOutlined, MoreOutlined, PlusOutlined, RightOutlined, SearchOutlined, SendOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import './ExamAdmin.css';

/* ══════════════════════════════════════════
   EXPRESSION ORALE — year → month → partie → 3 tâches
   Tâche 1 Présentation (points à aborder) · Tâche 2 Interaction · Tâche 3 Argumentation (sujets)
══════════════════════════════════════════ */

export interface EoPointAborder {
  id: number;
  tache_id: number;
  point_number: number;
  title: string;
  subtitle: string | null;
}

export interface EoSujet {
  id: number;
  tache_id: number;
  sujet_number: number;
  prompt_text: string;
  duration_seconds: number | null;
  correction_text: string | null;
}

export interface EoTache {
  id: number;
  partie_id: number;
  task_number: number;
  task_type: 'presentation' | 'interaction' | 'argumentation';
  prompt_text: string | null;
  prep_minutes: number;
  duration_minutes: number;
  points?: EoPointAborder[];
  sujets?: EoSujet[];
}

export interface EoPartie {
  id: number;
  month_id: number;
  name: string;
  display_order: number;
  taches: EoTache[];
  created_at: string;
  updated_at: string;
}

export interface EoYear {
  id: number;
  category_id: number;
  year: number;
  month_count: number;
  created_at: string;
}

export interface EoMonth {
  id: number;
  year_id: number;
  month: number;
  month_name: string;
  partie_count: number;
  created_at: string;
}

/** skeleton = no data for this parent yet · error = the request failed · data = show the list. */
export type ListView = 'skeleton' | 'error' | 'data';

const TASK_LABEL: Record<string, string> = {
  presentation: 'Présentation',
  interaction: 'Interaction orale',
  argumentation: 'Argumentation',
};
const TASK_DEFAULTS: Record<number, { type: string; prep: number; dur: number }> = {
  1: { type: 'presentation', prep: 0, dur: 2 },
  2: { type: 'interaction', prep: 2, dur: 3.5 },
  3: { type: 'argumentation', prep: 0, dur: 4.5 },
};
const MAX_POINTS = 4;

const fmtMinutes = (minutes: number) => {
  const m = Math.floor(minutes);
  const s = Math.round((minutes - m) * 60);
  return s === 0 ? `${m} min` : `${m} min ${s}s`;
};
const fmtSeconds = (sec: number | null) => {
  if (!sec) return '';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m === 0 ? `${s}s` : s === 0 ? `${m} min` : `${m} min ${s}s`;
};
const itemsOf = (t: EoTache) => (t.task_number === 1 ? t.points?.length || 0 : t.sujets?.length || 0);

const confirmDelete = (title: string, content: string, onOk: () => Promise<void> | void) =>
  Modal.confirm({ title, content, okText: 'Delete', okButtonProps: { danger: true }, cancelText: 'Cancel', onOk });

interface EoRenderProps {
  eoYears: EoYear[];
  eoMonths: EoMonth[];
  eoParties: EoPartie[];
  loading: boolean;
  selectedCategoryId: number | null;
  selectedCategoryName: string;
  selectedEoYearId: number | null;
  selectedEoYear: number | null;
  selectedEoMonthId: number | null;
  selectedEoMonthName: string;
  viewingPartie: EoPartie | null;
  eoCorrectionVisible: Record<number, boolean>;
  setSelectedEoYearId: (v: number | null) => void;
  setSelectedEoYear: (v: number | null) => void;
  setSelectedEoMonthId: (v: number | null) => void;
  setSelectedEoMonthName: (v: string) => void;
  setViewingPartie: (v: EoPartie | null) => void;
  setEoCorrectionVisible: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
  setView: (v: string) => void;
  setEoYearModalOpen: (v: boolean) => void;
  setEoMonthModalOpen: (v: boolean) => void;
  setEoPartieModalOpen: (v: boolean) => void;
  setEditingPartie: (v: EoPartie | null) => void;
  setEoTacheModalOpen: (v: boolean) => void;
  setEditingEoTache: (v: EoTache | null) => void;
  setEditingEoTacheNumber: (v: number) => void;
  setEditingEoTachePartieId: (v: number) => void;
  setEoPointModalOpen: (v: boolean) => void;
  setEditingEoPoint: (v: EoPointAborder | null) => void;
  setEditingEoPointTacheId: (v: number) => void;
  setEditingEoPointNextNum: (v: number) => void;
  setEoSujetModalOpen: (v: boolean) => void;
  setEditingEoSujet: (v: EoSujet | null) => void;
  setEditingEoSujetTacheId: (v: number) => void;
  setEditingEoSujetNextNum: (v: number) => void;
  navigateBack: () => void;
  fetchEoYears: () => void;
  fetchEoMonths: () => void;
  fetchEoParties: () => void;
  apiCall: (endpoint: string, options?: RequestInit) => Promise<Response>;
  setCategoryType: (v: string) => void;
  setSelectedCategoryId: (v: number | null) => void;
  setSelectedCategoryName: (v: string) => void;
  setEoYears: (v: EoYear[]) => void;
  setEoMonths: (v: EoMonth[]) => void;
  setEoParties: (v: EoPartie[]) => void;
  setEoImportModalOpen: (v: boolean) => void;
  /** What each list should show for the parent currently on screen. */
  yearsView?: ListView;
  monthsView?: ListView;
  partiesView?: ListView;
  /** Opens the unified assignment modal with this content preselected. */
  openAssign?: (preset: { content_type: string; content_id: number }[]) => void;
  partieQuery?: string;
  setPartieQuery?: (v: string) => void;
}

// These never empty the lists: each list carries a status for the parent it was loaded for
// (yearsStatus / monthsStatus / partiesStatus), so stale data can never be shown, and data
// already fetched stays available when you come back.
const toRoot = (p: EoRenderProps) => {
  p.setSelectedCategoryId(null);
  p.setSelectedCategoryName('');
  p.setCategoryType('ce');
  p.setView('categories');
};
const toYears = (p: EoRenderProps) => {
  p.setSelectedEoYearId(null);
  p.setSelectedEoYear(null);
  p.setView('eo-years');
};
const toMonths = (p: EoRenderProps) => {
  p.setSelectedEoMonthId(null);
  p.setSelectedEoMonthName('');
  p.setView('eo-months');
};

/** Shown when a list could not be loaded, so the screen is never blank with no way forward. */
const TreeError: React.FC<{ what: string; onRetry: () => void }> = ({ what, onRetry }) => (
  <div className="ea-state">
    <WarningOutlined />
    <strong>Couldn’t load the {what}</strong>
    <span>The server did not answer. Check your connection and try again.</span>
    <Button onClick={onRetry}>Retry</Button>
  </div>
);

const GridSkeleton: React.FC<{ n?: number }> = ({ n = 6 }) => (
  <div className="tr-grid">
    {Array.from({ length: n }, (_, i) => <div key={i} className="tr-card is-skeleton"><Skeleton active title={false} paragraph={{ rows: 2 }} /></div>)}
  </div>
);

/* ════════ Years ════════ */
export const renderEoYearsView = (p: EoRenderProps) => {
  const listView: ListView = p.yearsView || 'skeleton';
  const totalMonths = p.eoYears.reduce((t, y) => t + (Number(y.month_count) || 0), 0);

  return (
    <div className="ep fam-eo">
      <nav className="ep-crumbs" aria-label="Breadcrumb">
        <button type="button" onClick={() => toRoot(p)}>Exam preparation</button>
        <RightOutlined />
        <span>{p.selectedCategoryName}</span>
      </nav>

      <header className="ep-header">
        <div className="sl-title">
          <button type="button" className="ep-back" onClick={p.navigateBack} aria-label="Back to exam preparation"><ArrowLeftOutlined /></button>
          <span className="ep-cat-ic"><AudioOutlined /></span>
          <div>
            <h1 className="ep-title">{p.selectedCategoryName}</h1>
            <p className="ep-subtitle">{p.eoYears.length} {p.eoYears.length === 1 ? 'year' : 'years'} · {totalMonths} {totalMonths === 1 ? 'month' : 'months'} of exam sessions</p>
          </div>
        </div>
        <div className="ep-actions">
          <Button icon={<FolderOpenOutlined />} onClick={() => p.setEoImportModalOpen(true)}>Import from file</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => p.setEoYearModalOpen(true)}>Add year</Button>
        </div>
      </header>

      <section className="ep-card">
        {listView === 'skeleton' ? <GridSkeleton n={4} />
          : listView === 'error' ? <TreeError what="years" onRetry={p.fetchEoYears} />
          : p.eoYears.length === 0 ? (
            <div className="ea-state">
              <CalendarOutlined />
              <strong>No years yet</strong>
              <span>Add a year, then its months and parties — or import a whole year from a file.</span>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => p.setEoYearModalOpen(true)}>Add year</Button>
            </div>
          ) : (
            <div className="tr-grid">
              {p.eoYears.map(y => {
                const months = Number(y.month_count) || 0;
                const open = () => { p.setSelectedEoYearId(y.id); p.setSelectedEoYear(y.year); p.setView('eo-months'); };
                return (
                  <article key={y.id} className="tr-card is-year" role="button" tabIndex={0} onClick={open} onKeyDown={e => { if (e.key === 'Enter') open(); }}>
                    <div className="tr-card-top">
                      <span className="tr-year">{y.year}</span>
                      <span className="tr-menu" onClick={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()}>
                        <Dropdown trigger={['click']} menu={{
                          items: [
                            ...(p.openAssign ? [{ key: 'assign', icon: <SendOutlined />, label: 'Assign…', onClick: () => p.openAssign!([{ content_type: 'eo_year', content_id: y.id }]) }, { type: 'divider' as const }] : []),
                            {
                              key: 'delete', icon: <DeleteOutlined />, label: 'Delete year', danger: true,
                              onClick: () => confirmDelete(`Delete ${y.year}?`, `Its ${months} ${months === 1 ? 'month' : 'months'}, parties, tâches and sujets are deleted too. This can’t be undone.`, async () => {
                                const resp = await p.apiCall(`/tcf/eo/years/${y.id}`, { method: 'DELETE' });
                                if (!resp.ok) { message.error('The year could not be deleted.'); throw new Error(); }
                                message.success('Year deleted');
                                p.fetchEoYears();
                              }),
                            },
                          ],
                        }}>
                          <Button type="text" size="small" icon={<MoreOutlined />} aria-label={`Actions for ${y.year}`} />
                        </Dropdown>
                      </span>
                    </div>
                    <div className="tr-months" aria-hidden>
                      {Array.from({ length: 12 }, (_, i) => <span key={i} className={i < months ? 'is-on' : ''} />)}
                    </div>
                    <div className="tr-card-foot">
                      <em>{months} / 12 months</em>
                      <span className="ep-open">Open <RightOutlined /></span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
      </section>
    </div>
  );
};

/* ════════ Months ════════ */
export const renderEoMonthsView = (p: EoRenderProps) => {
  const listView: ListView = p.monthsView || 'skeleton';
  const totalParties = p.eoMonths.reduce((t, m) => t + (Number(m.partie_count) || 0), 0);
  const empty = p.eoMonths.filter(m => !Number(m.partie_count)).length;

  return (
    <div className="ep fam-eo">
      <nav className="ep-crumbs" aria-label="Breadcrumb">
        <button type="button" onClick={() => toRoot(p)}>Exam preparation</button>
        <RightOutlined />
        <button type="button" onClick={() => toYears(p)}>{p.selectedCategoryName}</button>
        <RightOutlined />
        <span>{p.selectedEoYear}</span>
      </nav>

      <header className="ep-header">
        <div className="sl-title">
          <button type="button" className="ep-back" onClick={p.navigateBack} aria-label={`Back to ${p.selectedCategoryName}`}><ArrowLeftOutlined /></button>
          <div>
            <h1 className="ep-title">{p.selectedEoYear}</h1>
            <p className="ep-subtitle">{p.eoMonths.length} {p.eoMonths.length === 1 ? 'month' : 'months'} · {totalParties} {totalParties === 1 ? 'partie' : 'parties'}{empty ? ` · ${empty} empty` : ''}</p>
          </div>
        </div>
        <div className="ep-actions">
          {p.openAssign && <Button icon={<SendOutlined />} onClick={() => p.openAssign!([{ content_type: 'eo_year', content_id: p.selectedEoYearId as number }])}>Assign year</Button>}
          <Button type="primary" icon={<PlusOutlined />} onClick={() => p.setEoMonthModalOpen(true)}>Add month</Button>
        </div>
      </header>

      <section className="ep-card">
        {listView === 'skeleton' ? <GridSkeleton />
          : listView === 'error' ? <TreeError what="months" onRetry={p.fetchEoMonths} />
          : p.eoMonths.length === 0 ? (
            <div className="ea-state">
              <CalendarOutlined />
              <strong>No months yet</strong>
              <span>Add the months of {p.selectedEoYear} that have exam content.</span>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => p.setEoMonthModalOpen(true)}>Add month</Button>
            </div>
          ) : (
            <div className="tr-grid">
              {p.eoMonths.map(m => {
                const count = Number(m.partie_count) || 0;
                const open = () => { p.setSelectedEoMonthId(m.id); p.setSelectedEoMonthName(m.month_name); p.setView('eo-parties'); };
                return (
                  <article key={m.id} className={`tr-card${count ? '' : ' is-empty'}`} role="button" tabIndex={0} onClick={open} onKeyDown={e => { if (e.key === 'Enter') open(); }}>
                    <div className="tr-card-top">
                      <span className="tr-num">{m.month}</span>
                      <span className="tr-card-name">
                        <strong>{m.month_name}</strong>
                        <em>{count ? `${count} ${count === 1 ? 'partie' : 'parties'}` : 'No parties yet'}</em>
                      </span>
                      <span className="tr-menu" onClick={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()}>
                        <Dropdown trigger={['click']} menu={{
                          items: [
                            ...(p.openAssign ? [{ key: 'assign', icon: <SendOutlined />, label: 'Assign…', onClick: () => p.openAssign!([{ content_type: 'eo_month', content_id: m.id }]) }, { type: 'divider' as const }] : []),
                            {
                              key: 'delete', icon: <DeleteOutlined />, label: 'Delete month', danger: true,
                              onClick: () => confirmDelete(`Delete ${m.month_name} ${p.selectedEoYear}?`, `Its ${count} ${count === 1 ? 'partie is' : 'parties are'} deleted too. This can’t be undone.`, async () => {
                                const resp = await p.apiCall(`/tcf/eo/months/${m.id}`, { method: 'DELETE' });
                                if (!resp.ok) { message.error('The month could not be deleted.'); throw new Error(); }
                                message.success('Month deleted');
                                p.fetchEoMonths();
                              }),
                            },
                          ],
                        }}>
                          <Button type="text" size="small" icon={<MoreOutlined />} aria-label={`Actions for ${m.month_name}`} />
                        </Dropdown>
                      </span>
                    </div>
                    <div className="tr-card-foot">
                      <em>{p.selectedEoYear}</em>
                      <span className="ep-open">Open <RightOutlined /></span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
      </section>
    </div>
  );
};

/* ════════ Parties ════════ */
export const renderEoPartiesView = (p: EoRenderProps) => {
  const listView: ListView = p.partiesView || 'skeleton';
  const q = (p.partieQuery || '').trim().toLowerCase();
  const parties = [...p.eoParties].sort((a, b) => (a.display_order || 0) - (b.display_order || 0) || a.id - b.id);
  const shown = q ? parties.filter(x => x.name.toLowerCase().includes(q)) : parties;
  const incomplete = parties.filter(x => x.taches.length < 3);
  const totalItems = parties.reduce((t, x) => t + x.taches.reduce((s, tache) => s + itemsOf(tache), 0), 0);

  const removePartie = (partie: EoPartie) => confirmDelete(
    `Delete “${partie.name}”?`,
    'Its tâches, points and sujets are deleted too. This can’t be undone.',
    async () => {
      const resp = await p.apiCall(`/tcf/eo/parties/${partie.id}`, { method: 'DELETE' });
      if (!resp.ok) { message.error('The partie could not be deleted.'); throw new Error(); }
      message.success('Partie deleted');
      p.fetchEoParties();
    },
  );

  return (
    <div className="ep fam-eo">
      <nav className="ep-crumbs" aria-label="Breadcrumb">
        <button type="button" onClick={() => toRoot(p)}>Exam preparation</button>
        <RightOutlined />
        <button type="button" onClick={() => toYears(p)}>{p.selectedCategoryName}</button>
        <RightOutlined />
        <button type="button" onClick={() => toMonths(p)}>{p.selectedEoYear}</button>
        <RightOutlined />
        <span>{p.selectedEoMonthName}</span>
      </nav>

      <header className="ep-header">
        <div className="sl-title">
          <button type="button" className="ep-back" onClick={p.navigateBack} aria-label={`Back to ${p.selectedEoYear}`}><ArrowLeftOutlined /></button>
          <div>
            <h1 className="ep-title">{p.selectedEoMonthName} {p.selectedEoYear}</h1>
            <p className="ep-subtitle">{parties.length} {parties.length === 1 ? 'partie' : 'parties'} · {totalItems} points and sujets</p>
          </div>
        </div>
        <div className="ep-actions">
          {p.openAssign && <Button icon={<SendOutlined />} onClick={() => p.openAssign!([{ content_type: 'eo_month', content_id: p.selectedEoMonthId as number }])}>Assign month</Button>}
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { p.setEditingPartie(null); p.setEoPartieModalOpen(true); }}>Add partie</Button>
        </div>
      </header>

      {listView === 'data' && incomplete.length > 0 && (
        <div className="sl-alert" role="note">
          <WarningOutlined />
          <span>
            <strong>{incomplete.length} {incomplete.length === 1 ? 'partie is' : 'parties are'} missing tâches</strong>
            {' — '}{incomplete.slice(0, 6).map(x => `${x.name} (${x.taches.length}/3)`).join(', ')}{incomplete.length > 6 ? '…' : ''}
          </span>
        </div>
      )}

      <section className="ep-card">
        {parties.length > 8 && p.setPartieQuery && (
          <div className="sl-toolbar">
            <Input allowClear prefix={<SearchOutlined />} placeholder="Search parties" value={p.partieQuery} onChange={e => p.setPartieQuery!(e.target.value)} />
          </div>
        )}
        {listView === 'skeleton' ? <GridSkeleton />
          : listView === 'error' ? <TreeError what="parties" onRetry={p.fetchEoParties} />
          : parties.length === 0 ? (
            <div className="ea-state">
              <AudioOutlined />
              <strong>No parties yet</strong>
              <span>A partie holds the three tâches of one oral exam session.</span>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => { p.setEditingPartie(null); p.setEoPartieModalOpen(true); }}>Add partie</Button>
            </div>
          ) : shown.length === 0 ? (
            <div className="ea-state"><SearchOutlined /><strong>No partie matches</strong><span>Try another name.</span></div>
          ) : (
            <div className="tr-grid">
              {shown.map(partie => {
                const items = partie.taches.reduce((s, t) => s + itemsOf(t), 0);
                const open = () => { p.setViewingPartie(partie); p.setView('eo-partie-detail'); };
                return (
                  <article key={partie.id} className={`tr-card${partie.taches.length < 3 ? ' is-warn' : ''}`} role="button" tabIndex={0} onClick={open} onKeyDown={e => { if (e.key === 'Enter') open(); }}>
                    <div className="tr-card-top">
                      <span className="tr-num">{partie.display_order || '–'}</span>
                      <span className="tr-card-name">
                        <strong>{partie.name}</strong>
                        <em>{items} {items === 1 ? 'item' : 'items'}</em>
                      </span>
                      <span className="tr-menu" onClick={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()}>
                        <Dropdown trigger={['click']} menu={{
                          items: [
                            { key: 'edit', icon: <EditOutlined />, label: 'Rename', onClick: () => { p.setEditingPartie(partie); p.setEoPartieModalOpen(true); } },
                            ...(p.openAssign ? [{ key: 'assign', icon: <SendOutlined />, label: 'Assign…', onClick: () => p.openAssign!([{ content_type: 'eo_partie', content_id: partie.id }]) }] : []),
                            { type: 'divider' as const },
                            { key: 'delete', icon: <DeleteOutlined />, label: 'Delete partie', danger: true, onClick: () => removePartie(partie) },
                          ],
                        }}>
                          <Button type="text" size="small" icon={<MoreOutlined />} aria-label={`Actions for ${partie.name}`} />
                        </Dropdown>
                      </span>
                    </div>
                    <div className="tr-tasks" aria-label={`${partie.taches.length} of 3 tâches`}>
                      {[1, 2, 3].map(n => {
                        const t = partie.taches.find(x => x.task_number === n);
                        return (
                          <Tooltip key={n} title={`Tâche ${n} — ${TASK_LABEL[TASK_DEFAULTS[n].type]}${t ? `: ${itemsOf(t)} ${n === 1 ? 'points' : 'sujets'}` : ' (missing)'}`}>
                            <span className={`tr-task is-t${n}${t ? '' : ' is-missing'}`}>{t ? <CheckOutlined /> : n}</span>
                          </Tooltip>
                        );
                      })}
                      <em>{partie.taches.length}/3 tâches</em>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
      </section>
    </div>
  );
};

/* ════════ Partie detail ════════ */
export const renderEoPartieDetailView = (p: EoRenderProps) => {
  const snapshot = p.viewingPartie;
  if (!snapshot) return null;
  const partie = p.eoParties.find(x => x.id === snapshot.id) || snapshot;
  const taches = [...partie.taches].sort((a, b) => a.task_number - b.task_number);
  const missing = [1, 2, 3].filter(n => !taches.some(t => t.task_number === n));
  const ordered = [...p.eoParties].sort((a, b) => (a.display_order || 0) - (b.display_order || 0) || a.id - b.id);
  const pos = ordered.findIndex(x => x.id === partie.id);
  const prev = pos > 0 ? ordered[pos - 1] : null;
  const next = pos >= 0 && pos < ordered.length - 1 ? ordered[pos + 1] : null;
  const totalMinutes = taches.reduce((t, x) => t + (Number(x.duration_minutes) || 0) + (Number(x.prep_minutes) || 0), 0);

  const editTache = (tache: EoTache | null, num: number) => {
    p.setEditingEoTache(tache);
    p.setEditingEoTacheNumber(num);
    p.setEditingEoTachePartieId(partie.id);
    p.setEoTacheModalOpen(true);
  };
  const removeTache = (tache: EoTache) => confirmDelete(
    `Delete tâche ${tache.task_number}?`,
    `Its ${tache.task_number === 1 ? 'points à aborder' : 'sujets'} are deleted too. This can’t be undone.`,
    async () => {
      const resp = await p.apiCall(`/tcf/eo/taches/${tache.id}`, { method: 'DELETE' });
      if (!resp.ok) { message.error('The tâche could not be deleted.'); throw new Error(); }
      message.success('Tâche deleted');
      p.fetchEoParties();
    },
  );

  const renderPresentation = (tache: EoTache) => {
    const points = [...(tache.points || [])].sort((a, b) => a.point_number - b.point_number);
    return (
      <section key={tache.id} className="pd-task is-t1">
        <header className="pd-task-head">
          <span className="pd-task-n">1</span>
          <div className="pd-task-id">
            <strong>Tâche 1 — Présentation</strong>
            <em>{fmtMinutes(tache.duration_minutes)}{tache.prep_minutes > 0 ? ` · ${fmtMinutes(tache.prep_minutes)} preparation` : ' · no preparation'} · {points.length}/{MAX_POINTS} points</em>
          </div>
          <span className="pd-task-actions">
            <Tooltip title="Edit tâche"><Button type="text" size="small" icon={<EditOutlined />} onClick={() => editTache(tache, 1)} aria-label="Edit tâche 1" /></Tooltip>
            <Tooltip title="Delete tâche"><Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => removeTache(tache)} aria-label="Delete tâche 1" /></Tooltip>
          </span>
        </header>
        {tache.prompt_text && <p className="pd-prompt">{tache.prompt_text}</p>}
        <div className="pd-sub">Points à aborder</div>
        <div className="pd-points">
          {points.map(pt => (
            <div key={pt.id} className="pd-point">
              <span className="pd-point-n">{pt.point_number}</span>
              <span className="pd-point-text"><strong>{pt.title}</strong>{pt.subtitle && <em>{pt.subtitle}</em>}</span>
              <span className="pd-point-actions">
                <Tooltip title="Edit"><Button type="text" size="small" icon={<EditOutlined />} onClick={() => { p.setEditingEoPoint(pt); p.setEditingEoPointTacheId(tache.id); p.setEditingEoPointNextNum(pt.point_number); p.setEoPointModalOpen(true); }} aria-label={`Edit point ${pt.point_number}`} /></Tooltip>
                <Tooltip title="Delete"><Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => confirmDelete(`Delete “${pt.title}”?`, 'This point is removed from the tâche.', async () => {
                  const resp = await p.apiCall(`/tcf/eo/points/${pt.id}`, { method: 'DELETE' });
                  if (!resp.ok) { message.error('The point could not be deleted.'); throw new Error(); }
                  message.success('Point deleted');
                  p.fetchEoParties();
                })} aria-label={`Delete point ${pt.point_number}`} /></Tooltip>
              </span>
            </div>
          ))}
          {points.length < MAX_POINTS && (
            <button type="button" className="pd-add" onClick={() => { p.setEditingEoPoint(null); p.setEditingEoPointTacheId(tache.id); p.setEditingEoPointNextNum(points.length + 1); p.setEoPointModalOpen(true); }}>
              <PlusOutlined /> Add point
            </button>
          )}
        </div>
      </section>
    );
  };

  const renderSujets = (tache: EoTache) => {
    const sujets = [...(tache.sujets || [])].sort((a, b) => a.sujet_number - b.sujet_number);
    return (
      <section key={tache.id} className={`pd-task is-t${tache.task_number}`}>
        <header className="pd-task-head">
          <span className="pd-task-n">{tache.task_number}</span>
          <div className="pd-task-id">
            <strong>Tâche {tache.task_number} — {TASK_LABEL[tache.task_type] || TASK_LABEL[TASK_DEFAULTS[tache.task_number]?.type]}</strong>
            <em>{tache.prep_minutes > 0 ? `${fmtMinutes(tache.prep_minutes)} preparation · ` : ''}{fmtMinutes(tache.duration_minutes)} · {sujets.length} {sujets.length === 1 ? 'sujet' : 'sujets'}</em>
          </div>
          <span className="pd-task-actions">
            <Tooltip title="Edit tâche"><Button type="text" size="small" icon={<EditOutlined />} onClick={() => editTache(tache, tache.task_number)} aria-label={`Edit tâche ${tache.task_number}`} /></Tooltip>
            <Tooltip title="Delete tâche"><Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => removeTache(tache)} aria-label={`Delete tâche ${tache.task_number}`} /></Tooltip>
          </span>
        </header>
        {tache.prompt_text && <p className="pd-prompt">{tache.prompt_text}</p>}
        <ul className="pd-sujets">
          {sujets.map(s => {
            const shown = p.eoCorrectionVisible[s.id];
            return (
              <li key={s.id}>
                <div className="pd-sujet-top">
                  <span className="pd-sujet-n">S{s.sujet_number}</span>
                  {s.duration_seconds ? <span className="pd-chip"><ClockCircleOutlined /> {fmtSeconds(s.duration_seconds)}</span> : null}
                  <span className="pd-sujet-actions">
                    <Tooltip title="Edit"><Button type="text" size="small" icon={<EditOutlined />} onClick={() => { p.setEditingEoSujet(s); p.setEditingEoSujetTacheId(tache.id); p.setEditingEoSujetNextNum(s.sujet_number); p.setEoSujetModalOpen(true); }} aria-label={`Edit sujet ${s.sujet_number}`} /></Tooltip>
                    <Tooltip title="Delete"><Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => confirmDelete(`Delete sujet ${s.sujet_number}?`, 'This sujet is removed from the tâche.', async () => {
                      const resp = await p.apiCall(`/tcf/eo/sujets/${s.id}`, { method: 'DELETE' });
                      if (!resp.ok) { message.error('The sujet could not be deleted.'); throw new Error(); }
                      message.success('Sujet deleted');
                      p.fetchEoParties();
                    })} aria-label={`Delete sujet ${s.sujet_number}`} /></Tooltip>
                  </span>
                </div>
                <p className="pd-sujet-text">{s.prompt_text}</p>
                {s.correction_text && (
                  <>
                    <button type="button" className="pd-link" onClick={() => p.setEoCorrectionVisible(prev => ({ ...prev, [s.id]: !prev[s.id] }))}>
                      {shown ? 'Hide correction' : 'Show correction'}
                    </button>
                    {shown && <div className="pd-correction">{s.correction_text}</div>}
                  </>
                )}
              </li>
            );
          })}
          <li className="pd-add-row">
            <button type="button" className="pd-add" onClick={() => { p.setEditingEoSujet(null); p.setEditingEoSujetTacheId(tache.id); p.setEditingEoSujetNextNum(sujets.length + 1); p.setEoSujetModalOpen(true); }}>
              <PlusOutlined /> Add sujet
            </button>
          </li>
        </ul>
      </section>
    );
  };

  return (
    <div className="ep fam-eo">
      <nav className="ep-crumbs" aria-label="Breadcrumb">
        <button type="button" onClick={() => toRoot(p)}>Exam preparation</button>
        <RightOutlined />
        <button type="button" onClick={() => toYears(p)}>{p.selectedCategoryName}</button>
        <RightOutlined />
        <button type="button" onClick={() => toMonths(p)}>{p.selectedEoYear}</button>
        <RightOutlined />
        <button type="button" onClick={() => { p.setViewingPartie(null); p.setEoCorrectionVisible({}); p.setView('eo-parties'); }}>{p.selectedEoMonthName}</button>
        <RightOutlined />
        <span>{partie.name}</span>
      </nav>

      <header className="ep-header">
        <div className="sl-title">
          <button type="button" className="ep-back" onClick={p.navigateBack} aria-label="Back to parties"><ArrowLeftOutlined /></button>
          <div>
            <h1 className="ep-title">{partie.name}</h1>
            <p className="ep-subtitle">{p.selectedEoMonthName} {p.selectedEoYear} · {taches.length}/3 tâches{totalMinutes ? ` · ${fmtMinutes(totalMinutes)} total` : ''}</p>
          </div>
        </div>
        <div className="ep-actions">
          {ordered.length > 1 && (
            <span className="sd-pager">
              <Tooltip title={prev ? `Previous: ${prev.name}` : 'First partie'}><Button icon={<ArrowLeftOutlined />} disabled={!prev} onClick={() => prev && p.setViewingPartie(prev)} aria-label="Previous partie" /></Tooltip>
              <Tooltip title={next ? `Next: ${next.name}` : 'Last partie'}><Button icon={<RightOutlined />} disabled={!next} onClick={() => next && p.setViewingPartie(next)} aria-label="Next partie" /></Tooltip>
            </span>
          )}
          <Button icon={<EditOutlined />} onClick={() => { p.setEditingPartie(partie); p.setEoPartieModalOpen(true); }}>Rename</Button>
          {p.openAssign && <Button icon={<SendOutlined />} onClick={() => p.openAssign!([{ content_type: 'eo_partie', content_id: partie.id }])}>Assign</Button>}
        </div>
      </header>

      <div className="pd-tasks">
        {taches.map(t => (t.task_number === 1 ? renderPresentation(t) : renderSujets(t)))}
        {missing.length > 0 && (
          <div className="pd-missing">
            <WarningOutlined />
            <span>{missing.length === 3 ? 'This partie has no tâches yet.' : `Missing tâche ${missing.join(' and ')}.`}</span>
            {missing.map(n => (
              <Button key={n} size="small" icon={<PlusOutlined />} onClick={() => editTache(null, n)}>
                Add tâche {n} — {TASK_LABEL[TASK_DEFAULTS[n].type]}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
