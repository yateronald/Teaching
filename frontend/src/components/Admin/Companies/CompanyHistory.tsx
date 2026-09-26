import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { App as AntApp, Button, DatePicker, Input, Skeleton } from 'antd';
import {
  ApartmentOutlined, AppstoreOutlined, CalendarOutlined, DownloadOutlined, EditOutlined, FileSearchOutlined, FlagOutlined,
  HistoryOutlined, PlusCircleOutlined, SearchOutlined, StopOutlined, TeamOutlined, ThunderboltOutlined, UserOutlined,
} from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import { useAuth } from '../../../contexts/AuthContext';
import { call, errorText } from '../../Org/orgModel';
import type { Company } from '../../Org/orgModel';
import { Empty } from '../../Org/OrgUi';
import { FILTERS, actorText, date, describe, historyCsv } from './historyModel';
import type { HistoryCategory, HistoryItem, HistoryPage, HistorySummary } from './historyModel';

/* Administrator: everything that happened to a company — access extensions,
   credits, package, status, exams, people — with before → after, who and
   when. Filter, search, export. English console. */

const en = (e: string) => e;
const ICON: Record<HistoryCategory, React.ReactNode> = {
  created: <FlagOutlined />, access: <CalendarOutlined />, credits: <ThunderboltOutlined />, handouts: <ThunderboltOutlined />,
  package: <TeamOutlined />, status: <StopOutlined />, exams: <AppstoreOutlined />, people: <UserOutlined />,
  activity: <ApartmentOutlined />, profile: <EditOutlined />, other: <HistoryOutlined />,
};

const CompanyHistory: React.FC<{ c: Company }> = ({ c }) => {
  const { apiCall } = useAuth();
  const { message } = AntApp.useApp();
  const [summary, setSummary] = useState<HistorySummary | null>(null);
  const [items, setItems] = useState<HistoryItem[] | null>(null);
  const [next, setNext] = useState<number | null>(null);
  const [filter, setFilter] = useState<HistoryCategory | 'all'>('all');
  const [range, setRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [query, setQuery] = useState('');
  const [q, setQ] = useState('');
  const [loadingMore, setLoadingMore] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const request = useRef(0);

  // Search waits for a pause in typing.
  useEffect(() => { const t = setTimeout(() => setQ(query.trim()), 300); return () => clearTimeout(t); }, [query]);

  const url = useCallback((before?: number | null, limit = 50) => {
    const p = new URLSearchParams({ limit: String(limit) });
    if (filter !== 'all') p.set('category', filter);
    if (range?.[0]) p.set('from', range[0].format('YYYY-MM-DD'));
    if (range?.[1]) p.set('to', range[1].format('YYYY-MM-DD'));
    if (q) p.set('q', q);
    if (before) p.set('before', String(before));
    return `/admin/organizations/${c.id}/history?${p}`;
  }, [c.id, filter, range, q]);

  const load = useCallback(async () => {
    const id = ++request.current;
    setError(null); setItems(null);
    try {
      const r = await call<HistoryPage>(apiCall, url());
      if (id !== request.current) return; // a newer filter won
      setSummary(r.summary); setItems(r.items); setNext(r.next_before);
    } catch (e) { if (id === request.current) setError(errorText(e, en)); }
  }, [apiCall, url]);
  // Reload on filter change, and when the company itself changes (after an extension, credits…).
  useEffect(() => { load(); }, [load, c]);

  const more = async () => {
    if (!next) return;
    setLoadingMore(true);
    try {
      const r = await call<HistoryPage>(apiCall, url(next));
      setItems(list => [...(list || []), ...r.items]); setNext(r.next_before);
    } catch (e) { message.error(errorText(e, en)); } finally { setLoadingMore(false); }
  };

  const exportCsv = async () => {
    setExporting(true);
    try {
      const all: HistoryItem[] = [];
      let before: number | null = null;
      do {
        const r: HistoryPage = await call<HistoryPage>(apiCall, url(before, 200));
        all.push(...r.items); before = r.next_before;
      } while (before && all.length < 10000);
      const blob = new Blob([historyCsv(c.name, all)], { type: 'text/csv;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${c.slug}-history-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      message.success(`${all.length} entr${all.length === 1 ? 'y' : 'ies'} exported`);
    } catch (e) { message.error(errorText(e, en)); } finally { setExporting(false); }
  };

  // Entries grouped by day, newest first.
  const days = useMemo(() => {
    const out: { day: string; items: HistoryItem[] }[] = [];
    for (const i of items || []) {
      const day = new Date(i.created_at).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      if (!out.length || out[out.length - 1].day !== day) out.push({ day, items: [] });
      out[out.length - 1].items.push(i);
    }
    return out;
  }, [items]);

  const s = summary;
  const filtered = filter !== 'all' || !!range || !!q;

  return (
    <div className="og-history">
      {s && (
        <div className="og-hsum">
          <button type="button" className={`og-hcard${filter === 'access' ? ' is-on' : ''}`} onClick={() => setFilter(filter === 'access' ? 'all' : 'access')}>
            <span className="og-hcard-label"><CalendarOutlined />Access</span>
            <strong>until {date(s.access.current_end)}</strong>
            <em>{s.access.extensions
              ? `${s.access.extensions} extension${s.access.extensions > 1 ? 's' : ''} · +${s.access.days_added} days`
              : 'Never extended'}{s.access.shortenings ? ` · ${s.access.shortenings} shortened` : ''}</em>
            <em>Initially until {date(s.access.original_end)}</em>
          </button>
          <button type="button" className={`og-hcard${filter === 'credits' ? ' is-on' : ''}`} onClick={() => setFilter(filter === 'credits' ? 'all' : 'credits')}>
            <span className="og-hcard-label"><ThunderboltOutlined />Credits given by you</span>
            <strong>{s.credits.granted.ee} EE · {s.credits.granted.eo} EO</strong>
            <em>{s.credits.revoked.ee || s.credits.revoked.eo ? `${s.credits.revoked.ee} EE · ${s.credits.revoked.eo} EO taken back` : 'Nothing taken back'}</em>
            <em>{s.credits.movements ? `${s.credits.movements} change${s.credits.movements > 1 ? 's' : ''} after creation · last ${date(s.credits.last_at)}` : 'Only the initial credits'}</em>
          </button>
          <button type="button" className={`og-hcard${filter === 'package' ? ' is-on' : ''}`} onClick={() => setFilter(filter === 'package' ? 'all' : 'package')}>
            <span className="og-hcard-label"><TeamOutlined />Package</span>
            <strong>{s.package.original === s.package.current ? `${s.package.current} accounts` : `${s.package.original} → ${s.package.current} accounts`}</strong>
            <em>{s.package.changes ? `${s.package.changes} change${s.package.changes > 1 ? 's' : ''}` : 'Unchanged since creation'}</em>
          </button>
          <button type="button" className={`og-hcard${filter === 'status' ? ' is-on' : ''}`} onClick={() => setFilter(filter === 'status' ? 'all' : 'status')}>
            <span className="og-hcard-label"><StopOutlined />Status</span>
            <strong>{s.status.current === 'suspended' ? 'Disabled' : 'Enabled'}</strong>
            <em>{s.status.suspensions ? `Disabled ${s.status.suspensions} time${s.status.suspensions > 1 ? 's' : ''}` : 'Never disabled'}</em>
            {s.status.last_change && <em>Last change {date(s.status.last_change.at)}</em>}
          </button>
        </div>
      )}

      <section className="og-card">
        <div className="og-toolbar og-htools">
          <div className="og-hchips" role="tablist" aria-label="Filter the history">
            {FILTERS.map(f => (
              <button key={f.key} type="button" role="tab" aria-selected={filter === f.key} className={`og-hchip${filter === f.key ? ' is-on' : ''}`} onClick={() => setFilter(f.key)}>{f.label}</button>
            ))}
          </div>
          <div className="og-hfilters">
            <Input allowClear prefix={<SearchOutlined />} placeholder="Search: email, invoice, exam…" value={query} onChange={e => setQuery(e.target.value)} />
            <DatePicker.RangePicker value={range} onChange={v => setRange(v as [Dayjs | null, Dayjs | null] | null)} format="DD/MM/YYYY" allowEmpty={[true, true]} />
            <Button icon={<DownloadOutlined />} onClick={exportCsv} loading={exporting} disabled={!items?.length}>Export CSV</Button>
          </div>
        </div>

        {error ? (
          <Empty icon={<HistoryOutlined />} title="The history could not be loaded" text={error} action={<Button onClick={load}>Try again</Button>} />
        ) : items === null ? (
          <div style={{ padding: 18 }}><Skeleton active paragraph={{ rows: 6 }} /></div>
        ) : items.length === 0 ? (
          <Empty icon={<FileSearchOutlined />} title={filtered ? 'Nothing matches these filters' : 'Nothing recorded yet'}
            action={filtered ? <Button onClick={() => { setFilter('all'); setRange(null); setQuery(''); }}>Clear the filters</Button> : undefined} />
        ) : (
          <div className="og-timeline">
            {days.map(g => (
              <div key={g.day} className="og-tday">
                <div className="og-tday-head">{g.day}</div>
                {g.items.map(i => {
                  const d = describe(i);
                  return (
                    <article key={i.id} className={`og-tentry tone-${d.tone} cat-${i.category}`}>
                      <span className="og-tdot" aria-hidden>{ICON[i.category] || <HistoryOutlined />}</span>
                      <div className="og-tbody">
                        <div className="og-ttitle">{d.title}</div>
                        {d.changes.length > 0 && (
                          <div className="og-tchanges">
                            {d.changes.map((ch, k) => (
                              <div key={k} className="og-tchange">
                                <span className="og-tchange-label">{ch.label}</span>
                                <span className="og-tfrom">{ch.from}</span>
                                <span className="og-tarrow" aria-label="changed to">→</span>
                                <span className="og-tto">{ch.to}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {d.facts.length > 0 && <div className="og-tfacts">{d.facts.map((f, k) => <span key={k}>{f}</span>)}</div>}
                        {d.note && <blockquote className="og-tnote">{d.note}</blockquote>}
                        <div className="og-tmeta">
                          <span>{new Date(i.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                          <span title={i.actor?.email || undefined}>{actorText(i.actor)}</span>
                          {i.actor?.email && i.actor.role === 'admin' && <span className="og-muted">{i.actor.email}</span>}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ))}
            {next && <div className="og-tmore"><Button onClick={more} loading={loadingMore} icon={<PlusCircleOutlined />}>Load older entries</Button></div>}
          </div>
        )}
      </section>
    </div>
  );
};

export default CompanyHistory;
