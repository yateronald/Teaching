import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Checkbox, Drawer, Input, InputNumber, Modal, Progress, Radio, Segmented, Select, Switch, Tooltip } from 'antd';
import {
  ArrowLeftOutlined, ArrowRightOutlined, CheckCircleFilled, CheckOutlined, ClockCircleOutlined, CloseCircleFilled,
  CloseOutlined, EditOutlined, ExclamationCircleFilled, EyeOutlined, FileTextOutlined, FolderOpenOutlined,
  InfoCircleFilled, LoadingOutlined, MinusCircleFilled, PauseCircleOutlined, PictureOutlined, ReloadOutlined, SyncOutlined,
  TableOutlined, UploadOutlined, WarningFilled,
} from '@ant-design/icons';
import {
  CEFR, LETTERS, groupSeriesFiles, importBody, importPayload, planPayload, questionBlocked, readSeriesFiles, recheck,
  seriesBlocked, seriesTotals, withSeriesIssues,
  type ImportImage, type ImportQuestion, type ImportSeries, type Issue, type Letter, type PlanEntry,
} from './ceImportModel';
import CeDocument from '../../Common/CeDocument';
import { ceDocumentHasImageSlot, ceDocumentPlain } from '../../Common/ceDocumentModel';
import './CeImport.css';

/* ══════════════════════════════════════════
   IMPORT — Compréhension écrite, a whole folder of series.
   1 · pick the main folder   2 · check the preview (fix or leave out what needs it)
   3 · import, one series at a time, with live progress and retry.
   Series already in the category are updated in place: learners keep their results.
══════════════════════════════════════════ */

type ApiCall = (endpoint: string, options?: RequestInit) => Promise<Response>;
type Stage = 'pick' | 'reading' | 'review' | 'importing' | 'done';
type Action = 'create' | 'update' | 'skip';
type RunStatus = 'pending' | 'running' | 'done' | 'failed' | 'stopped';
interface RunResult { mode: 'create' | 'update'; updated: number; added: number; removed: number; total_questions: number; total_points: number }
interface RunEntry { status: RunStatus; message?: string; result?: RunResult }

interface Props {
  open: boolean;
  onClose: () => void;
  /** Called after an import changed something, so the series list refreshes. */
  onImported: () => void;
  categoryId: number;
  apiCall: ApiCall;
}

const LEVEL_COLOR: Record<string, string> = { A1: '#22c55e', A2: '#16a34a', B1: '#3b82f6', B2: '#2563eb', C1: '#f59e0b', C2: '#dc2626' };
const plural = (n: number, one: string, many = `${one}s`) => `${n.toLocaleString('en-US')} ${n === 1 ? one : many}`;
const worst = (issues: Issue[]) => (issues.some(i => i.severity === 'error') ? 'error' : issues.some(i => i.severity === 'warning') ? 'warning' : issues.length ? 'info' : null);
const needsLook = (q: ImportQuestion) => q.issues.some(i => i.severity !== 'info');

const SeverityIcon: React.FC<{ severity: Issue['severity'] | null }> = ({ severity }) =>
  severity === 'error' ? <CloseCircleFilled className="ci-sev is-error" />
    : severity === 'warning' ? <WarningFilled className="ci-sev is-warning" />
      : severity === 'info' ? <InfoCircleFilled className="ci-sev is-info" /> : <CheckCircleFilled className="ci-sev is-ok" />;

const LevelTag: React.FC<{ level: string }> = ({ level }) => (
  <span className="ci-level" style={{ '--c': LEVEL_COLOR[level] || '#64748b' } as React.CSSProperties}>{level || '?'}</span>
);

const CeImportModal: React.FC<Props> = ({ open, onClose, onImported, categoryId, apiCall }) => {
  const [stage, setStage] = useState<Stage>('pick');
  const [series, setSeries] = useState<ImportSeries[]>([]);
  const [readProgress, setReadProgress] = useState({ done: 0, total: 0 });
  const [pickError, setPickError] = useState<string | null>(null);
  const [plan, setPlan] = useState<Record<string, PlanEntry> | null>(null);
  const [planState, setPlanState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [dbReady, setDbReady] = useState<boolean | null>(null);
  const [actions, setActions] = useState<Record<string, Action>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [seriesFilter, setSeriesFilter] = useState<'all' | 'attention' | 'create' | 'update'>('all');
  const [questionFilter, setQuestionFilter] = useState<'all' | 'attention' | 'explanation'>('all');
  const [editing, setEditing] = useState<{ seriesKey: string; uid: string } | null>(null);
  const [run, setRun] = useState<Record<string, RunEntry>>({});
  const [stopping, setStopping] = useState(false);
  const stopRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setStage('pick'); setSeries([]); setReadProgress({ done: 0, total: 0 }); setPickError(null);
    setPlan(null); setPlanState('idle'); setDbReady(null); setActions({}); setSelected(null);
    setSeriesFilter('all'); setQuestionFilter('all'); setEditing(null); setRun({}); setStopping(false); stopRef.current = false;
  }, []);
  useEffect(() => { if (!open) reset(); }, [open, reset]);

  /* ═══════════ 1 · READ THE FOLDER ═══════════ */
  const loadPlan = useCallback(async (list: ImportSeries[]) => {
    setPlanState('loading');
    try {
      const res = await apiCall('/tcf/series/import/plan', { method: 'POST', body: JSON.stringify(planPayload(list, categoryId)) });
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json() as { ready: boolean; series: PlanEntry[] };
      const byKey: Record<string, PlanEntry> = {};
      data.series.forEach(p => { byKey[p.key] = p; });
      setPlan(byKey);
      setDbReady(data.ready);
      setActions(prev => {
        const next = { ...prev };
        for (const s of list) if (!next[s.key]) next[s.key] = byKey[s.key]?.existing ? 'update' : 'create';
        return next;
      });
      setPlanState('ready');
    } catch {
      setPlanState('error');
    }
  }, [apiCall, categoryId]);

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;
    const entries = groupSeriesFiles(files);
    if (!entries.length) {
      setPickError('No tcf_questions.json in this folder. Choose the main folder that holds one sub-folder per series.');
      return;
    }
    setPickError(null);
    setPlan(null); setPlanState('idle'); setDbReady(null); setActions({}); setRun({}); setEditing(null); setSeriesFilter('all');
    setStage('reading');
    setReadProgress({ done: 0, total: entries.length });
    const list = await readSeriesFiles(entries, (done, total) => setReadProgress({ done, total }));
    setSeries(list);
    setSelected(list.find(s => worst(s.questions.flatMap(q => q.issues)) === 'error' || worst(s.questions.flatMap(q => q.issues)) === 'warning')?.key ?? list[0]?.key ?? null);
    setStage('review');
    void loadPlan(list);
  };

  /* ═══════════ 2 · REVIEW ═══════════ */
  const actionOf = useCallback((s: ImportSeries): Action => actions[s.key] || (plan?.[s.key]?.existing ? 'update' : 'create'), [actions, plan]);
  const toRun = useMemo(() => series.filter(s => s.include && actionOf(s) !== 'skip' && !seriesBlocked(s)), [series, actionOf]);
  const summary = useMemo(() => {
    const included = series.filter(s => s.include && actionOf(s) !== 'skip');
    const kept = included.flatMap(s => s.questions.filter(q => q.include));
    return {
      series: series.length,
      create: included.filter(s => actionOf(s) === 'create' && !seriesBlocked(s)).length,
      update: included.filter(s => actionOf(s) === 'update' && !seriesBlocked(s)).length,
      skipped: series.length - included.length,
      blocked: included.filter(s => !!seriesBlocked(s)).length,
      questions: toRun.reduce((t, s) => t + seriesTotals(s).questions, 0),
      attention: kept.filter(needsLook).length,
      noExplanation: kept.filter(q => !q.explanation.trim()).length,
      excluded: series.reduce((t, s) => t + s.questions.filter(q => !q.include).length, 0),
    };
  }, [series, toRun, actionOf]);

  const updateSeries = (key: string, fn: (s: ImportSeries) => ImportSeries) =>
    setSeries(list => list.map(s => (s.key === key ? withSeriesIssues(fn(s)) : s)));
  const updateQuestion = (key: string, uid: string, fn: (q: ImportQuestion) => ImportQuestion) =>
    updateSeries(key, s => ({ ...s, questions: s.questions.map(q => (q.uid === uid ? fn(q) : q)) }));

  const current = series.find(s => s.key === selected) || null;
  const shownSeries = series.filter(s => {
    const a = actionOf(s);
    if (seriesFilter === 'create') return a === 'create';
    if (seriesFilter === 'update') return a === 'update';
    if (seriesFilter === 'attention') return !!seriesBlocked(s) || s.seriesIssues.length > 0 || s.questions.some(q => q.include && needsLook(q));
    return true;
  });

  /* ═══════════ 3 · IMPORT ═══════════ */
  const importOne = async (s: ImportSeries): Promise<RunEntry> => {
    const existingId = actionOf(s) === 'update' ? plan?.[s.key]?.existing?.id ?? null : null;
    try {
      const res = await apiCall('/tcf/series/import', { method: 'POST', body: importBody(importPayload(s, categoryId, existingId)) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const detail = Array.isArray(data?.details) ? ` ${data.details.slice(0, 3).join(' · ')}` : '';
        return { status: 'failed', message: `${data?.error || `The server answered ${res.status}.`}${detail}` };
      }
      return { status: 'done', result: data as RunResult };
    } catch {
      return { status: 'failed', message: 'No answer from the server. Check the connection and retry.' };
    }
  };

  const startImport = async (only?: ImportSeries[]) => {
    const queue = only ?? toRun;
    if (!queue.length) return;
    stopRef.current = false;
    setStopping(false);
    setStage('importing');
    setRun(prev => {
      const next = { ...prev };
      queue.forEach(s => { next[s.key] = { status: 'pending' }; });
      return next;
    });
    let changed = false;
    for (let i = 0; i < queue.length; i++) {
      if (stopRef.current) {
        setRun(prev => {
          const next = { ...prev };
          queue.slice(i).forEach(s => { next[s.key] = { status: 'stopped' }; });
          return next;
        });
        break;
      }
      const s = queue[i];
      setRun(prev => ({ ...prev, [s.key]: { status: 'running' } }));
      const entry = await importOne(s);
      if (entry.status === 'done') changed = true;
      setRun(prev => ({ ...prev, [s.key]: entry }));
    }
    setStage('done');
    setStopping(false);
    if (changed) onImported();
  };

  const runList = series.filter(s => run[s.key]);
  const runCounts = useMemo(() => {
    const entries = runList.map(s => run[s.key]);
    return {
      total: entries.length,
      done: entries.filter(e => e.status === 'done').length,
      failed: entries.filter(e => e.status === 'failed').length,
      stopped: entries.filter(e => e.status === 'stopped').length,
      finished: entries.filter(e => e.status === 'done' || e.status === 'failed').length,
      created: entries.filter(e => e.result?.mode === 'create').length,
      updated: entries.filter(e => e.result?.mode === 'update').length,
      questions: entries.reduce((t, e) => t + (e.result?.total_questions || 0), 0),
    };
  }, [runList, run]);
  const runningSeries = runList.find(s => run[s.key]?.status === 'running');
  const failedSeries = runList.filter(s => run[s.key]?.status === 'failed' || run[s.key]?.status === 'stopped');

  const busy = stage === 'importing' || stage === 'reading';
  const requestClose = () => {
    if (stage === 'importing') return;
    if (stage === 'review' && series.length) {
      Modal.confirm({
        title: 'Leave the import?',
        content: 'Nothing has been imported yet. The preview and your corrections will be lost.',
        okText: 'Leave', cancelText: 'Stay', okButtonProps: { danger: true },
        onOk: onClose,
      });
      return;
    }
    onClose();
  };

  /* ═══════════ RENDER ═══════════ */
  const editingSeries = editing ? series.find(s => s.key === editing.seriesKey) : null;
  const editingQuestion = editingSeries?.questions.find(q => q.uid === editing?.uid) ?? null;

  return (
    <Modal open={open} onCancel={requestClose} footer={null} closable={false} centered maskClosable={false} keyboard={!busy}
      width="min(1200px, calc(100vw - 24px))" wrapClassName="ci-modal" styles={{ content: { padding: 0 }, body: { padding: 0 } }} destroyOnHidden>
      <div className="ci">
        <header className="ci-head">
          <span className="ci-head-ic"><UploadOutlined /></span>
          <div className="ci-head-text">
            <h2>Import reading series</h2>
            <p>Compréhension écrite · documents as text, with the explanation of each answer</p>
          </div>
          <ol className="ci-steps" aria-label="Steps">
            {['Folder', 'Preview', 'Import'].map((label, i) => {
              const at = { pick: 0, reading: 0, review: 1, importing: 2, done: 3 }[stage];
              const state = at > i ? 'is-done' : at === i ? 'is-on' : '';
              return <li key={label} className={state} aria-current={at === i ? 'step' : undefined}><b>{at > i ? <CheckOutlined /> : i + 1}</b>{label}</li>;
            })}
          </ol>
          <button type="button" className="ci-close" onClick={requestClose} disabled={stage === 'importing'} aria-label="Close"><CloseOutlined /></button>
        </header>

        {/* ── 1 · Folder ── */}
        <input ref={inputRef} type="file" hidden onChange={onPick} {...({ webkitdirectory: '', directory: '' } as Record<string, string>)} />
        {stage === 'pick' && (
          <div className="ci-pick">
            <button type="button" className="ci-drop" onClick={() => inputRef.current?.click()}>
              <FolderOpenOutlined />
              <strong>Choose the main folder</strong>
              <span>For example <code>comprehension ecrite</code>. Every sub-folder with a <code>tcf_questions.json</code> becomes a series.</span>
            </button>
            {pickError && <p className="ci-alert is-error" role="alert"><CloseCircleFilled /> {pickError}</p>}
            <div className="ci-explain">
              <div><b>1</b><span><strong>Nothing is sent yet.</strong> The folder is read in your browser and shown as a preview.</span></div>
              <div><b>2</b><span><strong>You check.</strong> Questions that need a look are flagged; fix them or leave them out.</span></div>
              <div><b>3</b><span><strong>Series already here are updated</strong>, not duplicated: learners keep their results.</span></div>
            </div>
          </div>
        )}

        {stage === 'reading' && (
          <div className="ci-center">
            <LoadingOutlined className="ci-spin" />
            <strong>Reading the folder…</strong>
            <span>{readProgress.done} / {readProgress.total} series</span>
            <Progress percent={readProgress.total ? Math.round((readProgress.done / readProgress.total) * 100) : 0} showInfo={false} style={{ width: 280 }} />
          </div>
        )}

        {/* ── 2 · Preview ── */}
        {stage === 'review' && (
          <>
            <section className="ci-summary" aria-label="Summary">
              <div className="ci-kpi"><span>Series</span><strong>{summary.series}</strong><em>{summary.skipped ? `${summary.skipped} left out` : 'all included'}</em></div>
              <div className="ci-kpi is-green"><span>New</span><strong>{planState === 'ready' ? summary.create : '–'}</strong><em>created</em></div>
              <div className="ci-kpi is-blue"><span>Already here</span><strong>{planState === 'ready' ? summary.update : '–'}</strong><em>updated in place</em></div>
              <div className="ci-kpi"><span>Questions</span><strong>{summary.questions.toLocaleString('en-US')}</strong><em>{summary.excluded ? `${summary.excluded} left out` : 'to import'}</em></div>
              <button type="button" className={`ci-kpi is-amber${seriesFilter === 'attention' ? ' is-on' : ''}`} onClick={() => setSeriesFilter(f => (f === 'attention' ? 'all' : 'attention'))}>
                <span>To check</span><strong>{summary.attention}</strong><em>{summary.blocked ? `${plural(summary.blocked, 'series')} blocked` : `${summary.noExplanation} without explanation`}</em>
              </button>
            </section>

            {planState === 'error' && (
              <p className="ci-alert is-error"><CloseCircleFilled /> The server could not compare the folder with the existing series.
                <Button size="small" icon={<ReloadOutlined />} onClick={() => loadPlan(series)}>Retry</Button></p>
            )}
            {dbReady === false && (
              <p className="ci-alert is-error"><CloseCircleFilled />
                <span>The database cannot store documents as text yet. Run <code>node database/run-ce-passage-migration.js</code> in the backend, then come back.</span>
                <Button size="small" icon={<ReloadOutlined />} onClick={() => loadPlan(series)}>Check again</Button></p>
            )}

            <div className="ci-body">
              <aside className="ci-list" aria-label="Series">
                <div className="ci-list-head">
                  <Segmented size="small" value={seriesFilter} onChange={v => setSeriesFilter(v as typeof seriesFilter)} options={[
                    { value: 'all', label: 'All' }, { value: 'attention', label: 'To check' },
                    { value: 'create', label: 'New' }, { value: 'update', label: 'Update' },
                  ]} />
                </div>
                <ul>
                  {shownSeries.map(s => {
                    const t = seriesTotals(s);
                    const blocked = seriesBlocked(s);
                    const action = actionOf(s);
                    const p = plan?.[s.key];
                    const sev = blocked ? 'error' : worst([...s.seriesIssues, ...s.questions.filter(q => q.include).flatMap(q => q.issues.filter(i => i.severity !== 'info'))]);
                    return (
                      <li key={s.key} className={`${selected === s.key ? 'is-on' : ''}${!s.include || action === 'skip' ? ' is-off' : ''}`}>
                        <Checkbox checked={s.include && action !== 'skip'} disabled={!!s.fileError}
                          onChange={e => {
                            const on = e.target.checked;
                            updateSeries(s.key, x => ({ ...x, include: on }));
                            if (on && action === 'skip') setActions(a => ({ ...a, [s.key]: p?.existing ? 'update' : 'create' }));
                          }} aria-label={`Import ${s.name}`} />
                        <button type="button" onClick={() => setSelected(s.key)}>
                          <span className="ci-list-num">{s.number || '–'}</span>
                          <span className="ci-list-text">
                            <strong>{s.name}</strong>
                            <em>{s.fileError ? 'Unreadable file' : `${t.questions} q · ${t.points} pts`}</em>
                          </span>
                          {planState !== 'ready' ? <span className="ci-tag"><LoadingOutlined /></span>
                            : action === 'skip' || !s.include ? <span className="ci-tag is-grey">Skip</span>
                              : p?.existing ? <span className="ci-tag is-blue">Update</span> : <span className="ci-tag is-green">New</span>}
                          {sev && sev !== 'info' && <SeverityIcon severity={sev} />}
                        </button>
                      </li>
                    );
                  })}
                  {!shownSeries.length && <li className="ci-list-empty">Nothing here.</li>}
                </ul>
              </aside>

              <section className="ci-detail" aria-label="Series detail" key={current?.key /* a new series starts at the top */}>
                {current ? (
                  <SeriesDetail
                    s={current}
                    plan={plan?.[current.key]}
                    planLoading={planState === 'loading'}
                    action={actionOf(current)}
                    onAction={a => { setActions(x => ({ ...x, [current.key]: a })); if (a !== 'skip') updateSeries(current.key, x => ({ ...x, include: true })); }}
                    filter={questionFilter}
                    onFilter={setQuestionFilter}
                    onOpen={uid => setEditing({ seriesKey: current.key, uid })}
                    onToggle={(uid, on) => updateQuestion(current.key, uid, q => ({ ...q, include: on }))}
                  />
                ) : <div className="ci-center"><FileTextOutlined /><span>Choose a series.</span></div>}
              </section>
            </div>

            <footer className="ci-foot">
              <Button icon={<FolderOpenOutlined />} onClick={() => inputRef.current?.click()}>Another folder</Button>
              <span className="ci-foot-note">
                {summary.blocked ? <><WarningFilled /> {plural(summary.blocked, 'series', 'series')} cannot be imported until fixed or left out.</>
                  : toRun.length ? <>Ready: {plural(toRun.length, 'series', 'series')}, {plural(summary.questions, 'question')}.</> : 'Nothing selected.'}
              </span>
              <Button onClick={requestClose}>Cancel</Button>
              <Button type="primary" icon={<UploadOutlined />} disabled={!toRun.length || planState !== 'ready' || !dbReady} onClick={() => startImport()}>
                Import {plural(toRun.length, 'series', 'series')}
              </Button>
            </footer>
          </>
        )}

        {/* ── 3 · Import ── */}
        {(stage === 'importing' || stage === 'done') && (
          <div className="ci-run">
            <section className="ci-run-top">
              {stage === 'importing' ? (
                <>
                  <div className="ci-run-title">
                    <SyncOutlined spin />
                    <div>
                      <strong>{runningSeries ? `Saving ${runningSeries.name}…` : 'Stopping…'}</strong>
                      <span>{runCounts.finished} of {runCounts.total} series · {runCounts.questions.toLocaleString('en-US')} questions saved. Keep this window open.</span>
                    </div>
                  </div>
                  <Progress percent={runCounts.total ? Math.round((runCounts.finished / runCounts.total) * 100) : 0}
                    status={runCounts.failed ? 'exception' : 'active'} strokeColor={runCounts.failed ? undefined : '#4f46e5'} />
                </>
              ) : (
                <div className={`ci-run-done${runCounts.failed || runCounts.stopped ? ' is-warn' : ''}`}>
                  {runCounts.failed || runCounts.stopped ? <ExclamationCircleFilled /> : <CheckCircleFilled />}
                  <div>
                    <strong>{runCounts.failed || runCounts.stopped ? 'Import finished with series left to do' : 'Import complete'}</strong>
                    <span>
                      {runCounts.created ? `${plural(runCounts.created, 'series', 'series')} created · ` : ''}
                      {runCounts.updated ? `${plural(runCounts.updated, 'series', 'series')} updated · ` : ''}
                      {plural(runCounts.questions, 'question')} saved
                      {runCounts.failed ? ` · ${runCounts.failed} failed` : ''}{runCounts.stopped ? ` · ${runCounts.stopped} not started` : ''}
                    </span>
                  </div>
                </div>
              )}
            </section>
            <ul className="ci-run-list">
              {runList.map(s => {
                const e = run[s.key];
                return (
                  <li key={s.key} className={`is-${e.status}`}
                    ref={e.status === 'running' ? el => el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }) : undefined}>
                    <span className="ci-run-ic">
                      {e.status === 'running' ? <LoadingOutlined /> : e.status === 'done' ? <CheckCircleFilled />
                        : e.status === 'failed' ? <CloseCircleFilled /> : e.status === 'stopped' ? <MinusCircleFilled /> : <ClockCircleOutlined />}
                    </span>
                    <strong>{s.name}</strong>
                    <em>
                      {e.status === 'pending' && 'Waiting'}
                      {e.status === 'running' && 'Saving…'}
                      {e.status === 'stopped' && 'Not started'}
                      {e.status === 'failed' && e.message}
                      {e.status === 'done' && e.result && (e.result.mode === 'create'
                        ? `Created · ${e.result.total_questions} questions · ${e.result.total_points} pts`
                        : `Updated · ${e.result.updated} changed, ${e.result.added} added, ${e.result.removed} removed · ${e.result.total_points} pts`)}
                    </em>
                  </li>
                );
              })}
            </ul>
            <footer className="ci-foot">
              {stage === 'importing' ? (
                <>
                  <span className="ci-foot-note">Each series is saved whole or not at all: stopping never leaves half a series.</span>
                  <Button icon={<PauseCircleOutlined />} disabled={stopping} onClick={() => { stopRef.current = true; setStopping(true); }}>
                    {stopping ? 'Stopping after this series…' : 'Stop after this series'}
                  </Button>
                </>
              ) : (
                <>
                  <span className="ci-foot-note">
                    {runCounts.failed ? 'Failed series can be sent again; the series already saved are not touched.'
                      : runCounts.stopped ? 'The series not started can be sent now; the series already saved are not touched.'
                        : 'The series list has been refreshed.'}
                  </span>
                  {failedSeries.length > 0 && (
                    <Button icon={<ReloadOutlined />} onClick={() => startImport(failedSeries)}>
                      {runCounts.failed ? `Retry ${plural(failedSeries.length, 'series', 'series')}` : `Import the ${failedSeries.length} remaining`}
                    </Button>
                  )}
                  <Button type="primary" onClick={onClose}>Close</Button>
                </>
              )}
            </footer>
          </div>
        )}
      </div>

      <QuestionDrawer
        series={editingSeries || null}
        question={editingQuestion}
        onClose={() => setEditing(null)}
        onNavigate={uid => setEditing(e => (e ? { ...e, uid } : e))}
        onSave={q => editingSeries && updateQuestion(editingSeries.key, q.uid, () => q)}
      />
    </Modal>
  );
};

/* ══════════ Series detail ══════════ */
const SeriesDetail: React.FC<{
  s: ImportSeries; plan?: PlanEntry; planLoading: boolean; action: Action; onAction: (a: Action) => void;
  filter: 'all' | 'attention' | 'explanation'; onFilter: (f: 'all' | 'attention' | 'explanation') => void;
  onOpen: (uid: string) => void; onToggle: (uid: string, on: boolean) => void;
}> = ({ s, plan, planLoading, action, onAction, filter, onFilter, onOpen, onToggle }) => {
  const t = seriesTotals(s);
  const blocked = seriesBlocked(s);
  const dist: Record<string, number> = {};
  s.questions.filter(q => q.include).forEach(q => { if (q.level) dist[q.level] = (dist[q.level] || 0) + 1; });
  const attention = s.questions.filter(needsLook).length;
  const noExpl = s.questions.filter(q => !q.explanation.trim()).length;
  const shown = s.questions.filter(q => (filter === 'attention' ? needsLook(q) : filter === 'explanation' ? !q.explanation.trim() : true));
  const ex = plan?.existing;

  if (s.fileError) {
    return <div className="ci-center"><CloseCircleFilled className="ci-sev is-error" /><strong>{s.name}</strong><span>{s.fileError}</span><code>{s.folder}</code></div>;
  }
  return (
    <div className="ci-series">
      <header className="ci-series-head">
        <div>
          <h3>{s.name}</h3>
          <p><code>{s.folder}</code> · {plural(t.questions, 'question')} · {t.points} pts · {s.durationMinutes} min</p>
        </div>
        <div className="ci-cefr" aria-label="Levels">
          {CEFR.map(l => dist[l] ? <span key={l} style={{ flex: dist[l], background: LEVEL_COLOR[l] }} title={`${l}: ${dist[l]}`} /> : null)}
        </div>
      </header>

      {planLoading ? (
        <p className="ci-plan"><LoadingOutlined /> Comparing with the series already in the platform…</p>
      ) : ex ? (
        <div className="ci-plan is-update">
          <div>
            <strong>{ex.name} is already in the platform</strong>
            <span>
              {ex.question_count} questions{ex.image_count ? `, ${ex.image_count} with an image document` : ''}.
              {' '}The import will update {plan?.matched ?? 0}, add {plan?.added ?? 0} and remove {plan?.removed ?? 0}
              {ex.image_count ? '; images give way to the text' : ''}.
              {ex.attempt_count ? ` ${plural(ex.attempt_count, 'learner result')} ${ex.attempt_count === 1 ? 'is' : 'are'} kept.` : ''}
            </span>
          </div>
          <Radio.Group size="small" value={action === 'skip' ? 'skip' : 'update'} onChange={e => onAction(e.target.value)} optionType="button" buttonStyle="solid"
            options={[{ value: 'update', label: 'Update it' }, { value: 'skip', label: 'Leave it' }]} />
        </div>
      ) : plan ? (
        <div className="ci-plan is-new">
          <div><strong>New series</strong><span>It will be created with the official TCF level scale (A2 from 200 points … C2 from 600).</span></div>
          <Radio.Group size="small" value={action === 'skip' ? 'skip' : 'create'} onChange={e => onAction(e.target.value)} optionType="button" buttonStyle="solid"
            options={[{ value: 'create', label: 'Create it' }, { value: 'skip', label: 'Leave it' }]} />
        </div>
      ) : null}

      {(blocked || s.seriesIssues.length > 0) && (
        <ul className="ci-issues">
          {blocked && <li className="is-error"><CloseCircleFilled /> {blocked}</li>}
          {s.seriesIssues.map((i, n) => <li key={n} className={`is-${i.severity}`}><WarningFilled /> {i.message}</li>)}
        </ul>
      )}

      <div className="ci-q-toolbar">
        <Segmented size="small" value={filter} onChange={v => onFilter(v as typeof filter)} options={[
          { value: 'all', label: `All ${s.questions.length}` },
          { value: 'attention', label: `To check ${attention}` },
          { value: 'explanation', label: `No explanation ${noExpl}` },
        ]} />
        <span className="ci-q-hint">Click a question to see it as learners will, and correct it.</span>
      </div>

      <ol className="ci-q-list">
        {shown.map(q => {
          const sev = worst(q.issues);
          return (
            <li key={q.uid} className={`${q.include ? '' : 'is-off'}${questionBlocked(q) ? ' is-error' : ''}`}>
              <span className="ci-q-num">{q.number}</span>
              <LevelTag level={q.level} />
              <button type="button" className="ci-q-main" onClick={() => onOpen(q.uid)}>
                <strong className={q.question ? '' : 'is-missing'}>{q.question || (q.passage ? 'Question missing: write it' : 'Empty question')}</strong>
                <em>{q.passage ? ceDocumentPlain(q.passage).slice(0, 140) || 'Image document' : 'No document'}</em>
                {q.issues.filter(i => i.severity !== 'info').slice(0, 2).map(i => (
                  <span key={i.code} className={`ci-q-issue is-${i.severity}`}><SeverityIcon severity={i.severity} /> {i.message}</span>
                ))}
              </button>
              <span className="ci-q-meta">
                <span>{q.points} pts</span>
                <span className="ci-q-ans">{q.answer || '?'}</span>
                {q.hasTable && <Tooltip title="The document has a table"><TableOutlined className="ci-q-flag" /></Tooltip>}
                {q.images.some(i => i.keep) && <Tooltip title="An image is imported with the document"><PictureOutlined className="ci-q-flag is-on" /></Tooltip>}
                <Tooltip title={q.explanation ? 'Has an explanation' : 'No explanation'}>
                  <span className={`ci-q-expl${q.explanation ? ' is-on' : ''}`}>E</span>
                </Tooltip>
                <SeverityIcon severity={sev === 'info' ? null : sev} />
              </span>
              <Tooltip title={q.include ? 'Leave this question out' : questionBlocked(q) ? 'Fix it first' : 'Import this question'}>
                <Switch size="small" checked={q.include} disabled={!q.include && questionBlocked(q)} onChange={on => onToggle(q.uid, on)} />
              </Tooltip>
              <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => onOpen(q.uid)} aria-label={`Open question ${q.number}`} />
            </li>
          );
        })}
        {!shown.length && <li className="ci-list-empty">No question in this view.</li>}
      </ol>
    </div>
  );
};

/** Local previews of a question's image files (revoked when the question changes). */
function useImageUrls(images: ImportImage[] | undefined) {
  const [urls, setUrls] = useState<Record<number, string>>({});
  useEffect(() => {
    const made: Record<number, string> = {};
    (images || []).forEach(i => { if (i.file) made[i.index] = URL.createObjectURL(i.file); });
    setUrls(made);
    return () => Object.values(made).forEach(u => URL.revokeObjectURL(u));
  }, [images]);
  return urls;
}

const ROLE_LABEL: Record<ImportImage['role'], string> = {
  document: 'Part of the document',
  illustration: 'Illustration',
  decorative: 'Decorative',
};

/* ══════════ One question: as learners see it, and its corrections ══════════ */
const QuestionDrawer: React.FC<{
  series: ImportSeries | null; question: ImportQuestion | null;
  onClose: () => void; onNavigate: (uid: string) => void; onSave: (q: ImportQuestion) => void;
}> = ({ series, question, onClose, onNavigate, onSave }) => {
  const [mode, setMode] = useState<'preview' | 'edit'>('preview');
  const [draft, setDraft] = useState<ImportQuestion | null>(null);
  const imageUrls = useImageUrls(question?.images);
  // A question that lacks its sentence opens ready to be completed.
  const uid = question?.uid;
  const missing = !!question?.issues.some(i => i.code === 'no-question' || i.code === 'question-in-document');
  useEffect(() => { setMode(missing ? 'edit' : 'preview'); }, [uid]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setDraft(question); }, [question]);

  if (!series || !question || !draft) return <Drawer open={false} onClose={onClose} />;
  const list = series.questions;
  const idx = list.findIndex(q => q.uid === question.uid);
  const prev = idx > 0 ? list[idx - 1] : null;
  const next = idx < list.length - 1 ? list[idx + 1] : null;
  const nextToCheck = list.slice(idx + 1).find(needsLook) || list.slice(0, idx).find(needsLook);
  const dirty = JSON.stringify(draft) !== JSON.stringify(question);

  const save = () => {
    const checked = recheck({ ...draft, edited: true });
    // Fixing a question that was left out for an error brings it back; one that still has an error stays out.
    const include = questionBlocked(checked) ? false : questionBlocked(question) ? true : draft.include;
    onSave({ ...checked, include });
    setMode('preview');
  };
  const go = (q: ImportQuestion | null | undefined) => { if (q) onNavigate(q.uid); };
  const set = (patch: Partial<ImportQuestion>) => setDraft(d => (d ? { ...d, ...patch } : d));
  const shown = mode === 'edit' ? draft : question;
  // One image per question is imported: keeping one leaves the others out.
  const toggleImage = (index: number, on: boolean) => {
    const images = question.images.map(i => ({ ...i, keep: on ? i.index === index : i.index === index ? false : i.keep }));
    const checked = recheck({ ...question, images });
    onSave({ ...checked, include: questionBlocked(checked) ? false : questionBlocked(question) ? true : question.include });
  };
  const keptImage = question.images.find(i => i.keep);
  const renderImage = (n: number) => {
    const img = question.images.find(i => i.index === n);
    return img?.keep && imageUrls[n] ? <img src={imageUrls[n]} alt={`Image ${n} of the document`} /> : null;
  };

  return (
    <Drawer open onClose={onClose} width="min(620px, 100vw)" zIndex={1100} closable={false} rootClassName="ci-drawer" title={null}
      footer={mode === 'edit' ? (
        <div className="ci-drawer-foot">
          <Button onClick={() => { setDraft(question); setMode('preview'); }}>Cancel</Button>
          <Button type="primary" icon={<CheckOutlined />} disabled={!dirty} onClick={save}>Save correction</Button>
        </div>
      ) : (
        <div className="ci-drawer-foot">
          <Button icon={<ArrowLeftOutlined />} disabled={!prev} onClick={() => go(prev)}>Previous</Button>
          {nextToCheck && <Button onClick={() => go(nextToCheck)}>Next to check</Button>}
          <Button icon={<ArrowRightOutlined />} disabled={!next} onClick={() => go(next)} iconPosition="end">Next</Button>
        </div>
      )}>
      <header className="ci-drawer-head">
        <div>
          <span className="ci-drawer-over">{series.name} · question {question.number} / {list.length}</span>
          <div className="ci-drawer-tags"><LevelTag level={shown.level} /><span>{shown.points} pts</span>{question.edited && <span className="ci-tag is-blue">Corrected</span>}{!question.include && <span className="ci-tag is-grey">Left out</span>}</div>
        </div>
        <Segmented size="small" value={mode} onChange={v => setMode(v as typeof mode)} options={[
          { value: 'preview', label: <><EyeOutlined /> Preview</> }, { value: 'edit', label: <><EditOutlined /> Correct</> },
        ]} />
        <button type="button" className="ci-close" onClick={onClose} aria-label="Close"><CloseOutlined /></button>
      </header>

      {question.issues.length > 0 && (
        <ul className="ci-issues">
          {question.issues.map(i => <li key={i.code} className={`is-${i.severity}`}><SeverityIcon severity={i.severity} /> {i.message}</li>)}
        </ul>
      )}

      {mode === 'preview' ? (
        <div className="ci-learner">
          <span className="ci-learner-label">As learners will see it</span>
          {question.passage || keptImage ? (
            <article className="ci-doc">
              <CeDocument text={question.passage} renderImage={renderImage} />
              {keptImage && !ceDocumentHasImageSlot(question.passage) && <div className="cedoc-image">{renderImage(keptImage.index)}</div>}
            </article>
          ) : <p className="ci-doc is-empty">No document.</p>}
          <p className={`ci-learner-q${question.question ? '' : ' is-missing'}`}>{question.question || 'The question is missing: use “Correct” to write it.'}</p>
          <ul className="ci-learner-opts">
            {LETTERS.map(k => (
              <li key={k} className={k === question.answer ? 'is-correct' : ''}>
                <b>{k}</b><span>{question.options[k] || <em>empty</em>}</span>{k === question.answer && <em>Correct answer</em>}
              </li>
            ))}
          </ul>
          <div className={`ci-expl${question.explanation ? '' : ' is-empty'}`}>
            <span>Explanation</span>
            <p>{question.explanation || 'No explanation: learners will only see the correct answer.'}</p>
          </div>
          {question.images.length > 0 && (
            <section className="ci-images" aria-label="Images of the document">
              <span className="ci-learner-label">Images found in the document</span>
              {question.images.map(img => (
                <div key={img.index} className={`ci-image${img.keep ? ' is-on' : ''}`}>
                  {imageUrls[img.index] ? <img src={imageUrls[img.index]} alt="" /> : <span className="ci-image-none">No file</span>}
                  <div>
                    <strong>Image {img.index} · {ROLE_LABEL[img.role]}</strong>
                    <em>{img.reason || (img.keep ? 'Imported with the document.' : 'Left out.')}</em>
                    <em>{img.fileName || 'file not saved by the scraper'}{img.width ? ` · ${img.width}×${img.height}` : ''}</em>
                  </div>
                  <Tooltip title={!img.file ? 'The file is not in the folder' : img.keep ? 'Leave this image out' : 'Import this image with the document'}>
                    <Switch size="small" checked={img.keep} disabled={!img.file && !img.keep} onChange={on => toggleImage(img.index, on)} />
                  </Tooltip>
                </div>
              ))}
            </section>
          )}
        </div>
      ) : (
        <div className="ci-form">
          <label>Document <em>line breaks are kept · **Title** · table rows | a | b | · [image] marks where the image goes</em>
            <Input.TextArea value={draft.passage} autoSize={{ minRows: 4, maxRows: 14 }} onChange={e => set({ passage: e.target.value })} />
          </label>
          <label>Question
            <Input.TextArea value={draft.question} autoSize={{ minRows: 1, maxRows: 4 }} status={draft.question.trim() ? undefined : 'warning'}
              placeholder="Write the question learners answer" onChange={e => set({ question: e.target.value })} />
          </label>
          <div className="ci-form-opts">
            {LETTERS.map(k => (
              <label key={k} className={draft.answer === k ? 'is-correct' : ''}>
                <span className="ci-form-key">
                  <Radio checked={draft.answer === k} onChange={() => set({ answer: k as Letter })} aria-label={`${k} is the correct answer`} />{k}
                </span>
                <Input value={draft.options[k]} status={draft.options[k].trim() ? undefined : 'error'} onChange={e => set({ options: { ...draft.options, [k]: e.target.value } })} />
              </label>
            ))}
          </div>
          <div className="ci-form-row">
            <label>Level
              <Select value={draft.level || undefined} placeholder="Level" onChange={v => set({ level: v })} options={CEFR.map(l => ({ value: l, label: l }))} />
            </label>
            <label>Points
              <InputNumber min={0} value={draft.points} onChange={v => set({ points: Number(v ?? 0) })} style={{ width: '100%' }} />
            </label>
            <label className="ci-form-include">Import it
              <Switch checked={draft.include} onChange={v => set({ include: v })} />
            </label>
          </div>
          <label>Explanation <em>shown to learners in the correction</em>
            <Input.TextArea value={draft.explanation} autoSize={{ minRows: 3, maxRows: 10 }} onChange={e => set({ explanation: e.target.value })} />
          </label>
        </div>
      )}
    </Drawer>
  );
};

export default CeImportModal;
