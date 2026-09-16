import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, ConfigProvider, Modal, Segmented, Skeleton, Tooltip } from 'antd';
import {
  ArrowLeftOutlined, BarChartOutlined, CalendarOutlined, DownloadOutlined, EnvironmentOutlined, LinkOutlined, ReloadOutlined,
  SettingOutlined, TeamOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAuth } from '../../contexts/AuthContext';
import { formatPlain, timezoneLabel } from '../../utils/timezone';
import BatchInsights from '../Teacher/BatchInsights';
import BatchStudentInsight from './BatchStudentInsight';
import { DEFAULT_FILTERS, computeView, fmtPct } from '../Insights/insightsModel';
import type { InsightsData } from '../Insights/insightsModel';
import { LEVEL_HINT, STATUS_LABEL, levelTone, progressOf, statusOf } from './batchUtils';
import type { Batch } from './batchUtils';
import '../Insights/BatchInsights.css';

/* ══════════════════════════════════════════
   BATCH INSIGHTS — page shell (header, tabs) + sessions view.
   /batches/:id/insights is loaded once and shared by Performance and Students.
══════════════════════════════════════════ */

interface Session {
  id: number;
  title: string;
  description?: string | null;
  start_time: string;
  end_time: string;
  type: string;
  location_mode?: string | null;
  location?: string | null;
  link?: string | null;
  status?: string | null;
}
type Tab = 'performance' | 'students' | 'sessions';

const BatchInsightsAdmin: React.FC = () => {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();
  const { apiCall, user, isAdmin } = useAuth();
  const tz = user?.timezone;

  const [data, setData] = useState<InsightsData | null>(null);
  const [meta, setMeta] = useState<Partial<Batch> & { students?: unknown[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('performance');
  const [studentId, setStudentId] = useState<number | null>(null);

  const [sessions, setSessions] = useState<Session[] | null>(null);
  const [sessionsError, setSessionsError] = useState(false);
  const [openSession, setOpenSession] = useState<Session | null>(null);

  const load = useCallback(async () => {
    if (!batchId) return;
    setError(null);
    try {
      const [iRes, bRes] = await Promise.all([apiCall(`/batches/${batchId}/insights`), apiCall(`/batches/${batchId}`)]);
      if (!iRes.ok) throw new Error((await iRes.json().catch(() => ({}))).error || 'Could not load this batch.');
      setData(await iRes.json());
      setMeta(bRes.ok ? await bRes.json() : null);
    } catch (e: any) {
      setError(e?.message || 'Could not load this batch.');
    } finally {
      setLoading(false);
    }
  }, [batchId, apiCall]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (tab !== 'sessions' || sessions || !batchId) return;
    apiCall(`/schedules/batch/${batchId}`)
      .then(res => (res.ok ? res.json() : Promise.reject()))
      .then(d => setSessions(Array.isArray(d) ? d : (d.schedules || [])))
      .catch(() => { setSessions([]); setSessionsError(true); });
  }, [tab, sessions, batchId, apiCall]);

  const view = useMemo(() => (data ? computeView(data, DEFAULT_FILTERS) : null), [data]);
  const fmtDate = (iso?: string, withYear = true) => formatPlain(iso, tz, withYear ? { month: 'short', day: 'numeric', year: 'numeric' } : { month: 'short', day: 'numeric' });
  const fmtTime = (iso: string) => formatPlain(iso, tz, { hour: 'numeric', minute: '2-digit', hour12: true });

  const exportCsv = () => {
    if (!view) return;
    const head = ['Student', 'Email', ...view.quizStats.map(q => `#${q.order} ${q.title}`), 'Average %', 'Quizzes done'];
    const body = view.studentStats.map(s => [
      s.name, s.email,
      ...view.quizStats.map(q => { const c = view.cellMap.get(`${s.id}:${q.quiz_id}`); return c ? (c.pct === null ? 'submitted' : Math.round(c.pct)) : ''; }),
      s.avg === null ? '' : Math.round(s.avg), `${s.submitted}/${s.expected}`,
    ]);
    const csv = [head, ...body].map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(data?.batch.name || 'batch').replace(/[^\w-]+/g, '-')}-gradebook-${dayjs().format('YYYY-MM-DD')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ── Loading / error ── */
  if (loading) {
    return (
      <div className="bi bi-page" aria-busy="true">
        <div className="bi-card bi-pad"><Skeleton active avatar={{ shape: 'square', size: 56 }} paragraph={{ rows: 2 }} /></div>
        <div className="bi-kpis">{[0, 1, 2, 3].map(i => <div key={i} className="bi-kpi"><Skeleton active title={false} paragraph={{ rows: 2 }} /></div>)}</div>
        <div className="bi-card bi-pad"><Skeleton active paragraph={{ rows: 8 }} /></div>
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="bi bi-page">
        <div className="bi-empty">
          <span className="bi-empty-ic"><BarChartOutlined /></span>
          <strong>Couldn’t load this batch</strong>
          <span>{error || 'The batch may have been deleted.'}</span>
          <div className="bi-empty-actions">
            <Button onClick={() => navigate(-1)}>Go back</Button>
            <Button type="primary" icon={<ReloadOutlined />} onClick={() => { setLoading(true); load(); }}>Try again</Button>
          </div>
        </div>
      </div>
    );
  }

  const b = data.batch;
  const statusInput = { ...b, student_count: 0, teacher_id: 0, created_at: b.start_date } as Batch;
  const status = statusOf(statusInput);
  const progress = progressOf(statusInput);
  const teacher = `${meta?.teacher_first_name || ''} ${meta?.teacher_last_name || ''}`.trim();
  const studentsCount = data.students.length;

  /* ── Sessions ── */
  const now = Date.now();
  const sessionList = [...(sessions || [])].sort((x, y) => new Date(x.start_time).getTime() - new Date(y.start_time).getTime());
  const upcoming = sessionList.filter(s => s.status !== 'cancelled' && new Date(s.end_time).getTime() > now);
  const past = sessionList.filter(s => s.status !== 'cancelled' && new Date(s.end_time).getTime() <= now);
  const cancelled = sessionList.filter(s => s.status === 'cancelled');
  const nextSession = upcoming[0];
  const byMonth = sessionList.reduce<Record<string, Session[]>>((acc, s) => {
    const k = dayjs(s.start_time).format('YYYY-MM');
    (acc[k] = acc[k] || []).push(s);
    return acc;
  }, {});

  const sessionsView = sessions === null ? (
    <div className="bi-card bi-pad"><Skeleton active paragraph={{ rows: 6 }} /></div>
  ) : (
    <div className="bi">
      <section className="bi-kpis">
        <div className="bi-kpi"><span className="bi-kpi-label">Sessions</span><div className="bi-kpi-row"><strong>{sessionList.length}</strong></div><span className="bi-kpi-sub">Scheduled for this batch</span></div>
        <div className="bi-kpi"><span className="bi-kpi-label">Held</span><div className="bi-kpi-row"><strong>{past.length}</strong></div><span className="bi-kpi-sub">Already took place</span></div>
        <div className="bi-kpi"><span className="bi-kpi-label">Upcoming</span><div className="bi-kpi-row"><strong>{upcoming.length}</strong></div><span className="bi-kpi-sub">{nextSession ? `Next ${fmtDate(nextSession.start_time, false)}` : 'Nothing planned'}</span></div>
        <div className={`bi-kpi${cancelled.length ? ' is-alert' : ''}`}><span className="bi-kpi-label">Cancelled</span><div className="bi-kpi-row"><strong>{cancelled.length}</strong></div><span className="bi-kpi-sub">Times in {timezoneLabel(tz)}</span></div>
      </section>

      {nextSession && (
        <button type="button" className="bi-next" onClick={() => setOpenSession(nextSession)}>
          <span className="bi-next-date"><em>{formatPlain(nextSession.start_time, tz, { month: 'short' })}</em><strong>{formatPlain(nextSession.start_time, tz, { day: 'numeric' })}</strong></span>
          <span className="bi-next-text">
            <span className="bi-next-over">Next session</span>
            <strong>{nextSession.title}</strong>
            <em>{formatPlain(nextSession.start_time, tz, { weekday: 'long' })} · {fmtTime(nextSession.start_time)} – {fmtTime(nextSession.end_time)}</em>
          </span>
          <span className={`bi-pill is-type-${nextSession.type}`}>{nextSession.type}</span>
        </button>
      )}

      <section className="bi-card">
        <header className="bi-card-head"><span className="bi-card-title"><CalendarOutlined /> All sessions</span></header>
        {sessionsError ? <div className="bi-muted-line">The schedule couldn’t be loaded.</div> : sessionList.length === 0 ? (
          <div className="bi-muted-line">No sessions scheduled for this batch yet.</div>
        ) : (
          <div className="bi-sessions">
            {Object.entries(byMonth).map(([key, list]) => (
              <div key={key} className="bi-month">
                <div className="bi-month-label">{dayjs(`${key}-01`).format('MMMM YYYY')} <span>{list.length}</span></div>
                <ul>
                  {list.map(s => {
                    const done = new Date(s.end_time).getTime() <= now;
                    return (
                      <li key={s.id}>
                        <button type="button" className={`${done ? 'is-done' : ''}${s.status === 'cancelled' ? ' is-cancelled' : ''}`} onClick={() => setOpenSession(s)}>
                          <span className="bi-ses-date"><strong>{formatPlain(s.start_time, tz, { day: 'numeric' })}</strong><em>{formatPlain(s.start_time, tz, { weekday: 'short' })}</em></span>
                          <span className={`bi-ses-bar is-type-${s.type}`} />
                          <span className="bi-ses-text">
                            <strong>{s.title}</strong>
                            <em>{fmtTime(s.start_time)} – {fmtTime(s.end_time)} · {s.location_mode === 'physical' ? (s.location || 'In person') : 'Online'}</em>
                          </span>
                          <span className={`bi-pill ${s.status === 'cancelled' ? 'is-f' : done ? 'is-none' : 'is-rank'}`}>{s.status === 'cancelled' ? 'Cancelled' : done ? 'Held' : 'Upcoming'}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );

  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#4f46e5', fontSize: 13, borderRadius: 8 } }}>
      <div className="bi bi-page">
        {/* ── Header ── */}
        <header className="bi-hero">
          <div className="bi-hero-main">
            <Tooltip title="Back">
              <button type="button" className="bi-back" onClick={() => navigate(-1)} aria-label="Back"><ArrowLeftOutlined /></button>
            </Tooltip>
            <span className={`bi-mark ${levelTone(b.french_level)}`}>{b.french_level}</span>
            <div className="bi-hero-id">
              <span className="bi-overline">Batch insights</span>
              <h1>{b.name}</h1>
              <div className="bi-hero-meta">
                <span>{LEVEL_HINT[b.french_level] || 'Level'} {b.french_level}</span>
                {teacher && <span><TeamOutlined /> {teacher}</span>}
                <span><CalendarOutlined /> {fmtDate(b.start_date)} – {fmtDate(b.end_date)}</span>
                <span>{studentsCount} {studentsCount === 1 ? 'student' : 'students'} · {data.quizzes.length} {data.quizzes.length === 1 ? 'quiz' : 'quizzes'}</span>
              </div>
            </div>
          </div>
          <div className="bi-hero-side">
            <div className="bi-hero-status">
              <span className={`bi-pill is-${status}`}>{STATUS_LABEL[status]}</span>
              {status !== 'upcoming' && <span className="bi-hero-prog"><i style={{ width: `${progress}%` }} /></span>}
              <span className="bi-muted">{status === 'running' ? `${progress}% through` : status === 'upcoming' ? `Starts ${fmtDate(b.start_date, false)}` : 'Finished'}</span>
            </div>
            <div className="bi-hero-actions">
              <Button icon={<DownloadOutlined />} onClick={exportCsv} disabled={!view || !data.quizzes.length}>Gradebook CSV</Button>
              {isAdmin && <Button icon={<SettingOutlined />} onClick={() => navigate('/app/batches')}>Manage</Button>}
            </div>
          </div>
        </header>

        <div className="bi-tabs">
          <Segmented value={tab} onChange={v => setTab(v as Tab)}
            options={[
              { value: 'performance', label: <span className="bi-seg"><BarChartOutlined /> Performance{view?.avg != null && <b>{fmtPct(view.avg)}</b>}</span> },
              { value: 'students', label: <span className="bi-seg"><TeamOutlined /> Students <b>{studentsCount}</b></span> },
              { value: 'sessions', label: <span className="bi-seg"><CalendarOutlined /> Sessions{sessions && <b>{sessions.length}</b>}</span> },
            ]} />
        </div>

        {tab === 'performance' && (
          <BatchInsights batchId={batchId as string} data={data} onOpenStudent={id => { setStudentId(id); setTab('students'); }} />
        )}
        {tab === 'students' && (
          <BatchStudentInsight batchId={batchId as string} data={data} studentId={studentId} onStudentChange={setStudentId} />
        )}
        {tab === 'sessions' && sessionsView}

        {/* ── Session details ── */}
        <Modal open={!!openSession} onCancel={() => setOpenSession(null)} footer={null} width={460} centered className="bi-modal">
          {openSession && (
            <div className="bi-md">
              <span className={`bi-pill is-type-${openSession.type}`}>{openSession.type}</span>
              <h3>{openSession.title}</h3>
              <dl>
                <div><dt>Date</dt><dd>{formatPlain(openSession.start_time, tz, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</dd></div>
                <div><dt>Time</dt><dd>{fmtTime(openSession.start_time)} – {fmtTime(openSession.end_time)} · {timezoneLabel(tz)}</dd></div>
                <div><dt>Status</dt><dd>{openSession.status === 'cancelled' ? 'Cancelled' : new Date(openSession.end_time).getTime() <= now ? 'Held' : 'Upcoming'}</dd></div>
                <div>
                  <dt>{openSession.location_mode === 'physical' ? 'Location' : 'Meeting'}</dt>
                  <dd>
                    {openSession.location_mode === 'physical'
                      ? <><EnvironmentOutlined /> {openSession.location || 'In person'}</>
                      : openSession.link ? <a href={openSession.link} target="_blank" rel="noreferrer"><LinkOutlined /> Open meeting link</a> : 'Online'}
                  </dd>
                </div>
              </dl>
              {openSession.description && <p className="bi-md-desc">{openSession.description}</p>}
            </div>
          )}
        </Modal>
      </div>
    </ConfigProvider>
  );
};

export default BatchInsightsAdmin;
