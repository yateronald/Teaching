import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Input, Segmented, Skeleton, Tooltip } from 'antd';
import {
  EyeOutlined, NotificationOutlined, PlusOutlined, ReloadOutlined, RightOutlined, RocketOutlined, SearchOutlined,
  TeamOutlined, ThunderboltOutlined, WarningOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { ApiError, call, errorText } from '../../Org/orgModel';
import { Empty, Kpi, PageHeader } from '../../Org/OrgUi';
import { promoImage } from '../../../promo/model';
import CampaignEditor from './CampaignEditor';
import { KIND_LABEL, AUDIENCE_LABEL, STATE_LABEL, ago, fmtShort, rate, type Campaign, type Summary } from './marketingModel';
import '../../Org/Org.css';
import './Marketing.css';

/* Administrator: every marketing campaign, what it brought, and the way to a new one. The admin console is in English. */

const en = (e: string) => e;
type Filter = 'all' | 'live' | 'scheduled' | 'draft' | 'over';

/** A small picture of the campaign: its theme, and its photo when it has one. */
export const CampaignThumb: React.FC<{ campaign: Pick<Campaign, 'theme' | 'image_key'>; size?: 'sm' | 'md' }> = ({ campaign, size = 'sm' }) => (
  <span className={`mk-thumb pm-t-${campaign.theme}${size === 'md' ? ' is-md' : ''}`} aria-hidden>
    {campaign.image_key && <img src={promoImage(campaign.image_key)} alt="" loading="lazy" />}
  </span>
);

export const StateChip: React.FC<{ state: Campaign['state'] }> = ({ state }) => (
  <span className={`og-pill tone-${STATE_LABEL[state].tone}`}>{STATE_LABEL[state].label}</span>
);

const Marketing: React.FC = () => {
  const { apiCall } = useAuth();
  const navigate = useNavigate();
  const [list, setList] = useState<Campaign[] | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notInstalled, setNotInstalled] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const r = await call<{ promotions: Campaign[]; summary: Summary }>(apiCall, '/admin/promotions');
      setList(r.promotions);
      setSummary(r.summary);
      setNotInstalled(false);
    } catch (e) {
      if (e instanceof ApiError && (e.data as { code?: string })?.code === 'PROMOTIONS_NOT_MIGRATED') setNotInstalled(true);
      setError(errorText(e, en));
    }
  }, [apiCall]);
  useEffect(() => { load(); }, [load]);

  const q = query.trim().toLowerCase();
  const visible = useMemo(() => (list || []).filter(c =>
    (filter === 'all' ? c.state !== 'archived' || !!q
      : filter === 'over' ? ['ended', 'paused', 'archived'].includes(c.state)
        : c.state === filter)
    && (!q || `${c.title_en || ''} ${c.title_fr || ''} ${c.slug}`.toLowerCase().includes(q))), [list, filter, q]);
  const count = (f: Filter) => (list || []).filter(c => (f === 'over' ? ['ended', 'paused', 'archived'].includes(c.state) : c.state === f)).length;

  return (
    <div className="og mk">
      <PageHeader overline="Administration" title="Marketing"
        subtitle="Campaigns shown on the public site: group classes that start soon, offers, free events and announcements. Publish one and it appears where you choose; visitors register online and you find them here."
        actions={<Button type="primary" icon={<PlusOutlined />} onClick={() => setCreating(true)} disabled={notInstalled}>New campaign</Button>} />

      <div className="og-kpis">
        <Kpi icon={<RocketOutlined />} label="Live on the site" value={summary?.live ?? '—'} note={summary ? `${summary.scheduled} scheduled` : undefined} />
        <Kpi icon={<TeamOutlined />} label="Registrations" value={summary?.registrations ?? '—'} note={summary ? `${summary.registrations_week} in the last 7 days` : undefined} />
        <Kpi icon={<NotificationOutlined />} label="Waiting for an answer" value={summary?.new_registrations ?? '—'} warn={!!summary?.new_registrations} note="Registrations still marked “New”" />
        <Kpi icon={<ThunderboltOutlined />} label="Views that became registrations" value={summary?.conversion != null ? `${summary.conversion} %` : '—'} note={summary ? `${summary.views.toLocaleString('en')} views in all` : undefined} />
      </div>

      <section className="og-card">
        <div className="og-toolbar">
          <Input allowClear prefix={<SearchOutlined />} placeholder="Search campaigns" value={query} onChange={e => setQuery(e.target.value)} />
          <Segmented value={filter} onChange={v => setFilter(v as Filter)} options={[
            { value: 'all', label: 'All' }, { value: 'live', label: `Live ${count('live')}` }, { value: 'scheduled', label: `Scheduled ${count('scheduled')}` },
            { value: 'draft', label: `Drafts ${count('draft')}` }, { value: 'over', label: 'Paused, ended, archived' },
          ]} />
          <span className="og-toolbar-spacer" />
          <Tooltip title="Refresh"><Button type="text" icon={<ReloadOutlined />} onClick={load} /></Tooltip>
        </div>
        {notInstalled ? (
          <Empty icon={<WarningOutlined />} title="Marketing is not installed on the server yet"
            text="Run backend/database/run-promotions-migration.js once on the server (it creates the three tables campaigns need), then come back to this page." action={<Button onClick={load}>Check again</Button>} />
        ) : error ? (
          <Empty icon={<WarningOutlined />} title="Campaigns could not be loaded" text={error} action={<Button onClick={load}>Try again</Button>} />
        ) : list === null ? (
          <div style={{ padding: 18 }}><Skeleton active paragraph={{ rows: 6 }} /></div>
        ) : visible.length === 0 ? (
          <Empty icon={<RocketOutlined />} title={list.length ? 'No campaign matches' : 'No campaign yet'}
            text={list.length ? 'Try another search or filter.' : 'Create your first campaign: a group that starts next month, with its dates, its seats and its price. Publish it and the site shows it at once.'}
            action={!list.length ? <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreating(true)}>New campaign</Button> : undefined} />
        ) : (
          <div className="og-list">
            <div className="og-row is-campaign is-head"><span>Campaign</span><span>State</span><span>On the site until</span><span>Registrations</span><span>Views → registered</span><span /></div>
            {visible.map(c => {
              const title = c.title_en || c.title_fr || 'Untitled';
              return (
                <div key={c.id} className="og-row is-campaign is-link" role="link" tabIndex={0}
                  onClick={() => navigate(`/app/marketing/${c.id}`)} onKeyDown={e => { if (e.key === 'Enter') navigate(`/app/marketing/${c.id}`); }}>
                  <span className="og-company-who">
                    <CampaignThumb campaign={c} />
                    <span className="og-cell-main"><strong>{title}</strong><em>{KIND_LABEL[c.kind]} · {AUDIENCE_LABEL[c.audience]}{c.level ? ` · ${c.level}` : ''}</em></span>
                  </span>
                  <span><StateChip state={c.state} /></span>
                  <span className="og-hide-sm og-cell-main">
                    <strong style={{ fontWeight: 500 }}>{c.ends_at ? fmtShort(c.ends_at) : 'No end date'}</strong>
                    <em>{c.state === 'scheduled' ? `starts ${fmtShort(c.starts_at)}` : `since ${fmtShort(c.starts_at)}`}</em>
                  </span>
                  <span className="og-cell-main">
                    <strong className="og-num">{c.registrations}{c.seat_limit ? <span className="og-muted"> · {c.seats_taken}/{c.seat_limit} seats</span> : null}
                      {c.new_registrations > 0 && <span className="mk-new">{c.new_registrations} new</span>}</strong>
                    <em>{c.last_registration_at ? `last one ${ago(c.last_registration_at)}` : 'nobody yet'}</em>
                  </span>
                  <span className="og-hide-sm og-cell-main">
                    <strong style={{ fontWeight: 500 }}><EyeOutlined className="og-muted" /> {c.views.toLocaleString('en')}</strong>
                    <em>{rate(c.registrations, c.views)} registered</em>
                  </span>
                  <span className="og-muted"><RightOutlined /></span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <CampaignEditor open={creating} onClose={() => setCreating(false)} onSaved={c => { setCreating(false); navigate(`/app/marketing/${c.id}`); }} />
    </div>
  );
};

export default Marketing;
