import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { App as AntApp, Button, Drawer, Dropdown, Input, Modal, Segmented, Select, Skeleton, Tabs, Tooltip } from 'antd';
import {
  ArrowLeftOutlined, CalendarOutlined, CheckCircleOutlined, CopyOutlined, DeleteOutlined, DownloadOutlined, EditOutlined, ExportOutlined,
  EyeOutlined, InboxOutlined, MailOutlined, MinusOutlined, MoreOutlined, PauseCircleOutlined, PhoneOutlined, PlayCircleOutlined, PlusOutlined, RocketOutlined,
  SearchOutlined, TeamOutlined, ThunderboltOutlined, WarningOutlined, WhatsAppOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { call, errorText } from '../../Org/orgModel';
import { Empty, Kpi } from '../../Org/OrgUi';
import { dateRange, type Lang } from '../../../promo/model';
import { PromoCard } from '../../../promo/parts';
import CampaignEditor from './CampaignEditor';
import FlyerStudio from './FlyerStudio';
import { CampaignThumb, StateChip } from './Marketing';
import {
  AUDIENCE_LABEL, KIND_LABEL, PLACE_LABEL, REG_STATUS, ago, campaignUrl, fieldsOf, fmtMoment, fmtShort, rate, registrationsCsv, seatsIn, seatsOnline, toPublic,
  type Campaign, type CampaignStats, type Registration, type RegistrationStatus,
} from './marketingModel';
import '../../Org/Org.css';
import './Marketing.css';

/* Administrator: one campaign — who registered, what it brought, its flyers. */

const en = (e: string) => e;
const STATUSES = Object.keys(REG_STATUS) as RegistrationStatus[];
/** A phone number as WhatsApp wants it in a link: digits only. */
const waNumber = (phone: string) => phone.replace(/[^\d]/g, '');

const CampaignDetail: React.FC = () => {
  const { id } = useParams();
  const { apiCall } = useAuth();
  const { message } = AntApp.useApp();
  const navigate = useNavigate();
  const [c, setC] = useState<Campaign | null>(null);
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [people, setPeople] = useState<Registration[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState('registrations');
  const [editing, setEditing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [one, regs] = await Promise.all([
        call<{ promotion: Campaign; stats: CampaignStats }>(apiCall, `/admin/promotions/${id}`),
        call<{ registrations: Registration[] }>(apiCall, `/admin/promotions/${id}/registrations`),
      ]);
      setC(one.promotion);
      setStats(one.stats);
      setPeople(regs.registrations);
    } catch (e) { setError(errorText(e, en)); }
  }, [apiCall, id]);
  useEffect(() => { load(); }, [load]);

  const preview = useMemo(() => (c ? toPublic(fieldsOf(c), { slug: c.slug, seats_online: seatsOnline(c) }) : null), [c]);

  if (error && !c) return <div className="og"><Empty icon={<WarningOutlined />} title="This campaign could not be loaded" text={error} action={<Button onClick={() => navigate('/app/marketing')}>All campaigns</Button>} /></div>;
  if (!c || !preview) return <div className="og"><Skeleton active paragraph={{ rows: 10 }} /></div>;

  const title = c.title_en || c.title_fr || 'Untitled';
  const setStatus = async (status: Campaign['status'], done: string) => {
    try {
      const r = await call<{ promotion: Campaign }>(apiCall, `/admin/promotions/${c.id}/status`, 'POST', { status });
      setC(r.promotion);
      message.success(done);
    } catch (e) { message.error(errorText(e, en)); }
  };
  const duplicate = async () => {
    try {
      const r = await call<{ promotion: Campaign }>(apiCall, `/admin/promotions/${c.id}/duplicate`, 'POST');
      message.success('Copied as a draft');
      navigate(`/app/marketing/${r.promotion.id}`);
    } catch (e) { message.error(errorText(e, en)); }
  };
  const remove = () => Modal.confirm({
    title: `Delete “${title}”?`,
    content: 'The campaign and its figures are removed for good. This cannot be undone.',
    okText: 'Delete the campaign', okButtonProps: { danger: true },
    onOk: async () => {
      try { await call(apiCall, `/admin/promotions/${c.id}`, 'DELETE'); message.success('Campaign deleted'); navigate('/app/marketing'); }
      catch (e) { message.error(errorText(e, en)); }
    },
  });
  const classDates = dateRange(c.class_starts_on, c.class_ends_on, 'en');
  const primary = c.status === 'draft'
    ? <Button type="primary" icon={<RocketOutlined />} onClick={() => setStatus('published', new Date(c.starts_at) > new Date() ? 'Published: it will appear at its start date' : 'Published: it is on the site now')}>Publish</Button>
    : c.status === 'published'
      ? <Button icon={<PauseCircleOutlined />} onClick={() => setStatus('paused', 'Paused: it is off the site')}>Pause</Button>
      : <Button type="primary" icon={<PlayCircleOutlined />} onClick={() => setStatus('published', 'Back on the site')}>{c.status === 'archived' ? 'Publish again' : 'Resume'}</Button>;

  return (
    <div className="og mk">
      <button type="button" className="og-back" onClick={() => navigate('/app/marketing')}><ArrowLeftOutlined />All campaigns</button>
      <div className="og-hero">
        <CampaignThumb campaign={c} size="md" />
        <div className="og-hero-main">
          <span className="og-overline">{KIND_LABEL[c.kind]} · {AUDIENCE_LABEL[c.audience]}</span>
          <h1 className="og-title">{title} <StateChip state={c.state} /></h1>
          <div className="og-hero-meta">
            <span><EyeOutlined />On the site {fmtShort(c.starts_at)} → {c.ends_at ? fmtMoment(c.ends_at) : 'no end date'}</span>
            {classDates && <span><CalendarOutlined />Class {classDates}</span>}
            {c.seat_limit ? <span><TeamOutlined />{c.seats_taken} / {c.seat_limit} seats{c.seats_offline ? ` (${c.seats_offline} outside the site)` : ''}{c.waitlist ? ` · ${c.waitlist} waiting` : ''}</span> : null}
          </div>
        </div>
        <div className="og-actions">
          {primary}
          <Button icon={<EditOutlined />} onClick={() => setEditing(true)}>Edit</Button>
          <Dropdown trigger={['click']} menu={{ items: [
            { key: 'site', icon: <ExportOutlined />, label: 'See it on the site', disabled: c.state !== 'live', onClick: () => window.open(campaignUrl(c.slug, c.title_fr && !c.title_en ? 'fr' : 'en'), '_blank', 'noopener') },
            { key: 'copy', icon: <CopyOutlined />, label: 'Duplicate as a draft', onClick: duplicate },
            { type: 'divider' },
            ...(c.status !== 'archived' ? [{ key: 'archive', icon: <InboxOutlined />, label: 'Archive', onClick: () => setStatus('archived', 'Archived') }] : []),
            ...(c.status !== 'draft' ? [{ key: 'draft', icon: <EditOutlined />, label: 'Back to draft', onClick: () => setStatus('draft', 'Back to draft: it is off the site') }] : []),
            { key: 'delete', icon: <DeleteOutlined />, danger: true, label: 'Delete', disabled: c.registrations > 0, title: c.registrations > 0 ? 'People registered: archive it instead' : undefined, onClick: remove },
          ] }}>
            <Button icon={<MoreOutlined />} aria-label="More actions" />
          </Dropdown>
        </div>
      </div>

      {c.state === 'draft' && <div className="og-banner tone-off"><EditOutlined /><div className="og-banner-body"><strong>Draft</strong><span>Only you see it. Publish it to put it on the site{new Date(c.starts_at) > new Date() ? ` from ${fmtMoment(c.starts_at)}` : ''}.</span></div></div>}
      {c.state === 'scheduled' && <div className="og-banner tone-soon"><CalendarOutlined /><div className="og-banner-body"><strong>Scheduled</strong><span>It will appear on the site on {fmtMoment(c.starts_at)}, by itself.</span></div></div>}
      {c.state === 'paused' && <div className="og-banner tone-warn"><PauseCircleOutlined /><div className="og-banner-body"><strong>Paused</strong><span>It is off the site and closed to registrations. The people who registered stay here.</span></div></div>}
      {c.state === 'ended' && <div className="og-banner tone-off"><CalendarOutlined /><div className="og-banner-body"><strong>Ended on {fmtMoment(c.ends_at)}</strong><span>It left the site by itself. Edit the end date to show it again, or duplicate it for the next group.</span></div></div>}

      <div className="og-kpis">
        <Kpi icon={<TeamOutlined />} label="Registrations" value={c.registrations} warn={c.new_registrations > 0}
          note={c.new_registrations ? `${c.new_registrations} waiting for an answer` : c.last_registration_at ? `last one ${ago(c.last_registration_at)}` : 'Nobody yet'} />
        {c.seat_limit
          ? <SeatsKpi campaign={c} onChange={setC} />
          : <Kpi icon={<CheckCircleOutlined />} label="Seats taken" value={c.seats_taken} note="No limit" />}
        <Kpi icon={<EyeOutlined />} label="Views" value={c.views.toLocaleString('en')} note={`${c.clicks.toLocaleString('en')} clicks · ${rate(c.clicks, c.views)}`} />
        <Kpi icon={<ThunderboltOutlined />} label="Views that became registrations" value={rate(c.registrations, c.views)} note="Registrations ÷ views" />
      </div>

      <Tabs className="og-tabs" activeKey={tab} onChange={setTab} items={[
        { key: 'registrations', label: `Registrations (${c.registrations})`, children: <Registrations campaign={c} rows={people} onChanged={load} /> },
        { key: 'performance', label: 'Performance', children: <Performance campaign={c} stats={stats} /> },
        { key: 'flyers', label: 'Flyers and link', children: <FlyerStudio promo={preview} live={c.state === 'live'} /> },
        { key: 'preview', label: 'Preview', children: <Preview campaign={c} /> },
      ]} />

      <CampaignEditor open={editing} campaign={c} onClose={() => setEditing(false)} onSaved={saved => { setEditing(false); setC(saved); load(); }} />
    </div>
  );
};

// ── The seats of the group ──
/** Taken / total, with the people registered outside the site (phone, WhatsApp,
 *  in person) counted in by hand: one tap when someone books by message. */
const SeatsKpi: React.FC<{ campaign: Campaign; onChange: (c: Campaign) => void }> = ({ campaign: c, onChange }) => {
  const { apiCall } = useAuth();
  const { message } = AntApp.useApp();
  const [busy, setBusy] = useState(false);
  const s = seatsIn(fieldsOf(c), seatsOnline(c));
  const add = async (n: number) => {
    setBusy(true);
    try {
      const r = await call<{ promotion: Campaign }>(apiCall, `/admin/promotions/${c.id}/seats`, 'POST', { add: n });
      onChange(r.promotion);
      message.success(n > 0 ? 'One more seat taken outside the site' : 'One seat freed');
    } catch (e) { message.error(errorText(e, en)); } finally { setBusy(false); }
  };
  return (
    <div className={`og-kpi mk-seats-kpi${s.full ? ' is-warn' : ''}`}>
      <span className="og-kpi-label"><CheckCircleOutlined />Seats</span>
      <span className="og-kpi-value">{s.taken} / {s.limit}</span>
      <span className="og-kpi-note">{s.full ? `Full · ${c.waitlist} on the waiting list` : `${s.left} left`} · {s.online} on the site</span>
      <span className="mk-seats-step">
        <Tooltip title="People registered by phone, WhatsApp or in person. They count as taken on the site."><span>Outside the site</span></Tooltip>
        <Button size="small" icon={<MinusOutlined />} aria-label="One seat less taken outside the site" disabled={busy || s.offline <= 0} onClick={() => add(-1)} />
        <b aria-live="polite">{s.offline}</b>
        <Tooltip title={s.full ? 'The group is full' : undefined}>
          <Button size="small" icon={<PlusOutlined />} aria-label="One more seat taken outside the site" disabled={busy || s.full} onClick={() => add(1)} />
        </Tooltip>
      </span>
    </div>
  );
};

// ── The people who registered ──
const Registrations: React.FC<{ campaign: Campaign; rows: Registration[] | null; onChanged: () => void }> = ({ campaign, rows, onChanged }) => {
  const { apiCall } = useAuth();
  const { message } = AntApp.useApp();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | RegistrationStatus>('all');
  const [openId, setOpenId] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const open = rows?.find(r => r.id === openId) || null;
  // The notes of the person opened (and their saved value once saved).
  const savedNotes = open?.notes || '';
  useEffect(() => { setNotes(savedNotes); }, [openId, savedNotes]);

  const q = query.trim().toLowerCase();
  const visible = (rows || []).filter(r => (filter === 'all' || r.status === filter)
    && (!q || `${r.full_name} ${r.email} ${r.phone || ''} ${r.country || ''}`.toLowerCase().includes(q)));
  const count = (s: RegistrationStatus) => (rows || []).filter(r => r.status === s).length;

  const change = async (r: Registration, patch: { status?: RegistrationStatus; notes?: string }, done?: string) => {
    try {
      await call(apiCall, `/admin/promotions/${campaign.id}/registrations/${r.id}`, 'PATCH', patch);
      if (done) message.success(done);
      onChanged();
    } catch (e) { message.error(errorText(e, en)); }
  };
  const remove = (r: Registration) => Modal.confirm({
    title: `Remove ${r.full_name}?`,
    content: 'Their registration is deleted for good and the seat is free again. To keep a trace, mark it “Cancelled” instead.',
    okText: 'Remove', okButtonProps: { danger: true },
    onOk: async () => {
      try { await call(apiCall, `/admin/promotions/${campaign.id}/registrations/${r.id}`, 'DELETE'); setOpenId(null); message.success('Registration removed'); onChanged(); }
      catch (e) { message.error(errorText(e, en)); }
    },
  });
  const exportCsv = () => {
    const blob = new Blob([registrationsCsv(visible)], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${campaign.slug}-registrations.csv`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  };

  return (
    <section className="og-card">
      <div className="og-toolbar">
        <Input allowClear prefix={<SearchOutlined />} placeholder="Search a name, an email, a country" value={query} onChange={e => setQuery(e.target.value)} />
        <Segmented value={filter} onChange={v => setFilter(v as typeof filter)} options={[
          { value: 'all', label: `All ${rows?.length ?? 0}` },
          ...STATUSES.filter(s => s === 'new' || count(s) > 0).map(s => ({ value: s, label: `${REG_STATUS[s].label} ${count(s)}` })),
        ]} />
        <span className="og-toolbar-spacer" />
        <Tooltip title="The list as shown, for Excel or Google Sheets"><Button icon={<DownloadOutlined />} onClick={exportCsv} disabled={!visible.length}>Export CSV</Button></Tooltip>
      </div>
      {rows === null ? (
        <div style={{ padding: 18 }}><Skeleton active paragraph={{ rows: 5 }} /></div>
      ) : visible.length === 0 ? (
        <Empty icon={<TeamOutlined />} title={rows.length ? 'Nobody matches' : 'Nobody has registered yet'}
          text={rows.length ? 'Try another search or filter.' : campaign.state === 'live' ? 'The campaign is on the site. Share its link and its flyers (tab “Flyers and link”) to bring the first registrations.' : 'Registrations arrive here as soon as the campaign is live.'} />
      ) : (
        <div className="og-list">
          <div className="og-row is-registration is-head"><span>Person</span><span>Contact</span><span>Level</span><span>Registered</span><span>Status</span></div>
          {visible.map(r => (
            <div key={r.id} className={`og-row is-registration is-link${r.status === 'new' ? ' is-fresh' : ''}`} role="button" tabIndex={0}
              onClick={() => setOpenId(r.id)} onKeyDown={e => { if (e.key === 'Enter') setOpenId(r.id); }}>
              <span className="og-cell-main"><strong>{r.full_name}</strong><em>{r.country || '—'}{r.message ? ' · left a message' : ''}</em></span>
              <span className="og-hide-sm og-cell-main"><strong style={{ fontWeight: 500 }}>{r.email}</strong><em>{r.phone || 'no phone'}</em></span>
              <span className="og-hide-sm">{r.level || '—'}</span>
              <span className="og-hide-sm og-cell-main"><strong style={{ fontWeight: 500 }}>{ago(r.created_at)}</strong><em>{r.placement ? PLACE_LABEL[r.placement] : '—'} · {r.language.toUpperCase()}</em></span>
              <span onClick={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()} role="presentation">
                <Select size="small" value={r.status} variant="borderless" className={`mk-status tone-${REG_STATUS[r.status].tone}`} popupMatchSelectWidth={false}
                  onChange={s => change(r, { status: s }, `${r.full_name}: ${REG_STATUS[s].label.toLowerCase()}`)}
                  options={STATUSES.map(s => ({ value: s, label: REG_STATUS[s].label }))} />
              </span>
            </div>
          ))}
        </div>
      )}

      <Drawer open={!!open} onClose={() => setOpenId(null)} width="min(520px, 100vw)" rootClassName="og-drawer" title={open?.full_name}
        footer={open && <div className="og-foot">
          <Button danger type="text" icon={<DeleteOutlined />} onClick={() => remove(open)}>Remove</Button>
          <span style={{ flex: 1 }} />
          <Button onClick={() => setOpenId(null)}>Close</Button>
          <Button type="primary" disabled={notes === (open.notes || '')} onClick={() => change(open, { notes }, 'Notes saved')}>Save notes</Button>
        </div>}>
        {open && (
          <div className="og-form">
            <div className="mk-contact">
              <a href={`mailto:${open.email}`}><MailOutlined />{open.email}</a>
              {open.phone && <a href={`tel:${open.phone.replace(/\s+/g, '')}`}><PhoneOutlined />{open.phone}</a>}
              {open.phone && waNumber(open.phone).length >= 8 && <a href={`https://wa.me/${waNumber(open.phone)}`} target="_blank" rel="noopener noreferrer"><WhatsAppOutlined />WhatsApp</a>}
            </div>
            <section className="og-section">
              <div className="og-field"><label>Status</label>
                <Segmented value={open.status} onChange={s => change(open, { status: s as RegistrationStatus })} options={STATUSES.map(s => ({ value: s, label: REG_STATUS[s].label }))} />
                <small>{REG_STATUS[open.status].hint}</small></div>
            </section>
            <dl className="mk-facts">
              <div><dt>Country</dt><dd>{open.country || '—'}</dd></div>
              <div><dt>French today</dt><dd>{open.level || '—'}</dd></div>
              <div><dt>Registered</dt><dd>{fmtMoment(open.created_at)}</dd></div>
              <div><dt>Came from</dt><dd>{open.placement ? PLACE_LABEL[open.placement] : '—'}{open.source_path ? ` · ${open.source_path}` : ''}</dd></div>
              <div><dt>Language of the page</dt><dd>{open.language === 'fr' ? 'Français' : 'English'}</dd></div>
              <div><dt>Time zone</dt><dd>{open.timezone || '—'}</dd></div>
            </dl>
            {open.message && <div className="og-field"><label>Their message</label><p className="mk-message">{open.message}</p></div>}
            <div className="og-field"><label>Your notes <em>only administrators see them</em></label>
              <Input.TextArea value={notes} onChange={e => setNotes(e.target.value)} maxLength={2000} autoSize={{ minRows: 3, maxRows: 8 }} placeholder="e.g. Called on Monday, prefers evenings. Paid by transfer." /></div>
          </div>
        )}
      </Drawer>
    </section>
  );
};

// ── What the campaign brought, place by place and day by day ──
const Performance: React.FC<{ campaign: Campaign; stats: CampaignStats | null }> = ({ campaign, stats }) => {
  if (!stats) return <Skeleton active paragraph={{ rows: 6 }} />;
  const days = (() => {
    // The last 14 days, including those with nothing.
    const views = new Map(stats.days.map(d => [d.day, d]));
    const regs = new Map(stats.registration_days.map(d => [d.day, d.registrations]));
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date(Date.now() - (13 - i) * 86_400_000);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      return { key, label: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }), views: views.get(key)?.views || 0, registrations: regs.get(key) || 0 };
    });
  })();
  const peak = Math.max(1, ...days.map(d => d.views));
  const top = Math.max(1, ...stats.places.map(p => p.views));
  const untracked = campaign.registrations - stats.places.reduce((t, p) => t + p.registrations, 0);
  return (
    <div className="og-grid">
      <section className="og-card" style={{ gridColumn: 'span 7' }}>
        <div className="og-card-head"><span className="og-card-title">Where it was seen</span><span className="og-card-note">Since it was published</span></div>
        {stats.places.length === 0 ? <Empty icon={<EyeOutlined />} title="Not seen yet" text="Figures appear as soon as visitors see the campaign on the site." /> : (
          <div className="mk-places">
            <div className="mk-place is-head"><span>Place</span><span>Views</span><span>Clicks</span><span>Registered</span></div>
            {stats.places.map(p => (
              <div key={p.placement} className="mk-place">
                <span className="mk-place-name"><strong>{PLACE_LABEL[p.placement] || p.placement}</strong><i><b style={{ transform: `scaleX(${p.views / top})` }} /></i></span>
                <span className="og-num">{p.views.toLocaleString('en')}</span>
                <span>{p.clicks.toLocaleString('en')} <em>{rate(p.clicks, p.views)}</em></span>
                <span className="og-num">{p.registrations}</span>
              </div>
            ))}
            {untracked > 0 && <p className="og-card-note" style={{ padding: '10px 18px' }}>{untracked} registration(s) came through a shared link or a place with no view counted.</p>}
          </div>
        )}
      </section>
      <section className="og-card" style={{ gridColumn: 'span 5' }}>
        <div className="og-card-head"><span className="og-card-title">Last 14 days</span><span className="og-card-note">Views, and registrations above the bars</span></div>
        <div className="og-card-body">
          <div className="mk-days" role="img" aria-label={`Views per day over the last 14 days, ${days.reduce((t, d) => t + d.views, 0)} in all`}>
            {days.map(d => (
              <Tooltip key={d.key} title={`${d.label}: ${d.views} view(s), ${d.registrations} registration(s)`}>
                <div className="mk-day">
                  <span className="mk-day-reg">{d.registrations || ''}</span>
                  <i style={{ height: `${Math.max(d.views ? 4 : 1, (d.views / peak) * 100)}%` }} className={d.registrations ? 'has-reg' : ''} />
                </div>
              </Tooltip>
            ))}
          </div>
          <div className="mk-days-axis"><span>{days[0].label}</span><span>{days[days.length - 1].label}</span></div>
        </div>
      </section>
    </div>
  );
};

// ── The campaign as visitors see it ──
const Preview: React.FC<{ campaign: Campaign }> = ({ campaign }) => {
  const [lang, setLang] = useState<Lang>(campaign.title_fr && !campaign.title_en ? 'fr' : 'en');
  const promo = useMemo(() => toPublic(fieldsOf(campaign), { slug: campaign.slug, seats_online: seatsOnline(campaign) }), [campaign]);
  const on = [campaign.place_home && 'Home page', campaign.place_learn && 'Free courses', campaign.place_bar && 'Top bar', campaign.place_flash && 'Flash pop-up', 'Offers page'].filter(Boolean).join(' · ');
  return (
    <section className="og-card">
      <div className="og-card-head"><span className="og-card-title">On the site</span>
        <Segmented size="small" value={lang} onChange={v => setLang(v as Lang)} options={[{ value: 'en', label: 'English' }, { value: 'fr', label: 'Français' }]} /></div>
      <div className="og-card-body mk-preview-tab">
        <PromoCard promo={promo} lang={lang} variant="wide" onOpen={() => {}} inert />
        <p className="og-card-note">Shown on: {on}.</p>
      </div>
    </section>
  );
};

export default CampaignDetail;
