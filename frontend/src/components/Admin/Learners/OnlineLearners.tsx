// Executive Admin workspace for Website Online Courses:
// - Live Free vs Paid Plans mode switcher
// - Clickable KPI overview tiles
// - People directory with multi-facet server filters, sorting, CSV export & mobile cards
// - Companies directory with website access & organization-wide plans
// - Plans & Payments studio (delegated to BillingAdmin)
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  App, Button, Checkbox, ConfigProvider, DatePicker, Drawer, Input,
  Popconfirm, Segmented, Select, Skeleton, Table, Tag, Timeline, Tooltip,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ArrowRightOutlined, BankOutlined, CloseOutlined, CopyOutlined,
  CreditCardOutlined, CrownFilled, DownloadOutlined, ExportOutlined,
  FieldTimeOutlined, GlobalOutlined, GoogleOutlined, MailOutlined,
  NotificationOutlined, ReloadOutlined, RightOutlined, SearchOutlined,
  StopOutlined, TeamOutlined, UserOutlined, WhatsAppOutlined,
} from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';
import { useAuth } from '../../../contexts/AuthContext';
import useResponsive from '../../../hooks/useResponsive';
import { headerHeight } from '../../Layout/layoutMetrics';
import { ago, call, fmtDate } from '../../Org/orgModel';
import BillingAdmin from './BillingAdmin';
import CoursesModeSwitch from './CoursesModeSwitch';
import './OnlineLearners.css';

type Filter = 'all' | 'learners' | 'portal' | 'premium' | 'requests';
type TierFilter = '' | 'premium' | 'standard' | 'free' | 'off';
type LevelFilter = '' | 'beginner' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'none';
type SourceFilter = '' | 'google' | 'email' | 'portal';
type SortKey = 'recent' | 'seen_desc' | 'joined_desc' | 'joined_asc' | 'name_asc';
type PlanTier = 'standard' | 'premium';
type OrgAccessFilter = 'all' | 'paid' | 'free' | 'off';

interface Row {
  id: number; first_name: string; last_name: string; email: string; role: string; is_active: boolean; created_at: string;
  signup_source: string | null; email_verified: boolean; learn_access: 'off' | 'free'; country: string | null;
  whatsapp: string | null; french_level: string | null; google_linked: boolean;
  organization_id: number | null; organization: string | null; organization_access: 'off' | 'free' | null;
  premium: boolean; premium_tier?: PlanTier; premium_until: string | null; premium_source: string | null; premium_via_company: boolean;
  request_id: number | null; requested_at: string | null; request_message: string | null; last_seen_at: string | null;
}

interface Stats {
  learners: number;
  total_people?: number;
  portal_people?: number;
  new_week: number;
  premium_people: number;
  standard_people?: number;
  premium_tier_people?: number;
  active_7d?: number;
  open_requests: number;
}

interface ListAnswer { rows: Row[]; total: number; page: number; limit: number; stats: Stats }

interface Detail {
  user: {
    id: number; first_name: string; last_name: string; email: string; role: string; is_active: boolean;
    created_at: string; signup_source: string | null; email_verified: boolean; google_linked: boolean;
    country: string | null; whatsapp: string | null; french_level: string | null; lang: string | null;
    marketing_opt_in: boolean; learn_access: 'off' | 'free';
    organization: { id: number; name: string; learn_access: string } | null;
  };
  access: { level: 'visitor' | 'free' | 'premium'; plan?: 'visitor' | 'free' | 'standard' | 'premium'; website: boolean; premium: { until: string | null; via: string; tier?: PlanTier } | null };
  licenses: { id: number; tier?: PlanTier; source: string; starts_at: string; ends_at: string | null; reason: string | null; created_at: string; revoked_at: string | null; revoke_reason: string | null; via_company: boolean; active: boolean; created_by_name: string | null }[];
  history: { action: string; detail: Record<string, unknown> | null; created_at: string; actor_name: string | null }[];
  requests: { id: number; message: string | null; status: string; created_at: string }[];
  devices: number;
  lessons_opened_30d: number;
}

interface Org {
  id: number; name: string; status: string; learn_access: 'off' | 'free';
  accounts: number; premium: boolean; premium_tier?: PlanTier | null; premium_until: string | null;
}

const ROLE_LABEL: Record<string, string> = {
  learner: 'Website learner',
  student: 'Student',
  candidate: 'Company learner',
  org_admin: 'Company manager',
};
const ACTION_LABEL: Record<string, string> = {
  signup: 'Signed up', premium_granted: 'Plan activated', premium_revoked: 'Plan ended', premium_requested: 'Asked for Premium',
  premium_request_dismissed: 'Request dismissed', website_access: 'Website access changed', google_linked: 'Google sign-in added',
  google_unlinked: 'Google sign-in removed', password_changed: 'Password changed', password_reset: 'Password reset', suspended: 'Suspended', restored: 'Restored',
};
const L = 'en-CA';
const enTr = (en: string) => en;

const initials = (first?: string | null, last?: string | null, email?: string | null) =>
  `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase() || (email?.[0] || '?').toUpperCase();

const levelTone = (lv: string | null) => {
  if (!lv || lv === 'beginner') return 'is-start';
  if (lv.startsWith('A')) return 'is-a';
  if (lv.startsWith('B')) return 'is-b';
  return 'is-c';
};
const levelText = (lv: string) => (lv === 'beginner' ? 'Beginner' : lv);

function AccessBadge({ row }: { row: Row }) {
  if (row.premium) {
    const isStd = row.premium_tier === 'standard';
    return (
      <div className="ol-access-cell">
        <span className={`ol-access-pill ${isStd ? 'is-standard' : 'is-premium'}`}>
          {!isStd && <CrownFilled aria-hidden />}
          {isStd ? 'Standard' : 'Premium'}
        </span>
        <span className="ol-access-sub">
          {row.premium_until ? `Until ${fmtDate(row.premium_until, L)}` : 'No end date'}
          {row.premium_via_company ? ' · Company' : ''}
        </span>
      </div>
    );
  }
  const website = row.role === 'learner' || row.learn_access === 'free' || row.organization_access === 'free';
  return (
    <div className="ol-access-cell">
      <span className={`ol-access-pill ${website ? 'is-free' : 'is-off'}`}>
        {website ? 'Free' : 'Website off'}
      </span>
    </div>
  );
}

export default function OnlineLearners() {
  const { apiCall } = useAuth();
  const { message } = App.useApp();
  const r = useResponsive();

  const [view, setView] = useState<'people' | 'companies' | 'payments'>('people');
  const [learnMode, setLearnMode] = useState<'free' | 'premium' | null>(null);

  // Server-backed People filters & pagination
  const [filter, setFilter] = useState<Filter>('all');
  const [tierFilter, setTierFilter] = useState<TierFilter>('');
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('');
  const [sort, setSort] = useState<SortKey>('recent');
  const [q, setQ] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [data, setData] = useState<ListAnswer | null>(null);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState<number | null>(null);
  const [orgs, setOrgs] = useState<Org[] | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        filter,
        sort,
        page: String(page),
        limit: String(limit),
        ...(tierFilter ? { tier: tierFilter } : {}),
        ...(levelFilter ? { level: levelFilter } : {}),
        ...(sourceFilter ? { source: sourceFilter } : {}),
        ...(query ? { q: query } : {}),
      });
      setData(await call<ListAnswer>(apiCall, `/admin/learners?${params}`));
    } catch (e) {
      message.error((e as Error).message || 'Could not load the list.');
    } finally {
      setLoading(false);
    }
  }, [apiCall, filter, sort, page, limit, tierFilter, levelFilter, sourceFilter, query, message]);

  const loadOrgs = useCallback(async () => {
    try {
      setOrgs(await call<{ rows: Org[] }>(apiCall, '/admin/learners/organizations').then(d => d.rows));
    } catch (e) {
      message.error((e as Error).message);
    }
  }, [apiCall, message]);

  useEffect(() => {
    if (view === 'people') void load();
    else if (view === 'companies') void loadOrgs();
  }, [view, load, loadOrgs]);

  useEffect(() => {
    const t = window.setTimeout(() => { setQuery(q.trim()); setPage(1); }, 280);
    return () => window.clearTimeout(t);
  }, [q]);

  const copyText = useCallback(async (text: string, label = 'Copied') => {
    try {
      await navigator.clipboard.writeText(text);
      message.success(label);
    } catch {
      message.error('Clipboard unavailable');
    }
  }, [message]);

  const hasExtraFilters = filter !== 'all' || !!tierFilter || !!levelFilter || !!sourceFilter || sort !== 'recent' || !!query;
  const resetFilters = () => {
    setFilter('all');
    setTierFilter('');
    setLevelFilter('');
    setSourceFilter('');
    setSort('recent');
    setQ('');
    setQuery('');
    setPage(1);
  };

  const exportCsv = () => {
    const rows = data?.rows || [];
    if (!rows.length) return;
    const csvRows: (string | number)[][] = [
      ['ID', 'First name', 'Last name', 'Email', 'Account type', 'Company', 'Plan / Access', 'Plan until', 'French level', 'WhatsApp', 'Country', 'Request date', 'Joined', 'Last active'],
      ...rows.map(row => [
        row.id,
        row.first_name,
        row.last_name,
        row.email,
        ROLE_LABEL[row.role] || row.role,
        row.organization || '',
        row.premium ? (row.premium_tier === 'standard' ? 'Standard' : 'Premium') : (row.role === 'learner' || row.learn_access === 'free' || row.organization_access === 'free' ? 'Free' : 'Website off'),
        row.premium_until ? dayjs(row.premium_until).format('YYYY-MM-DD') : '',
        row.french_level ? levelText(row.french_level) : '',
        row.whatsapp || '',
        row.country || '',
        row.requested_at ? dayjs(row.requested_at).format('YYYY-MM-DD') : '',
        dayjs(row.created_at).format('YYYY-MM-DD'),
        row.last_seen_at ? dayjs(row.last_seen_at).format('YYYY-MM-DD') : '',
      ]),
    ];
    const csv = csvRows.map(line => line.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `online-learners-${dayjs().format('YYYY-MM-DD')}.csv`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  const columns: ColumnsType<Row> = useMemo(() => [
    {
      title: 'Person',
      key: 'name',
      width: 300,
      render: (_, row) => (
        <div className="ol-person">
          <span className={`ol-avatar is-${row.role}`} aria-hidden>{initials(row.first_name, row.last_name, row.email)}</span>
          <div className="ol-person-text">
            <div className="ol-person-name">
              <span>{row.first_name} {row.last_name}</span>
              {row.french_level && (
                <span className={`ol-level-pill ${levelTone(row.french_level)}`}>{levelText(row.french_level)}</span>
              )}
              {!row.is_active && <Tag color="red" style={{ margin: 0 }}>Suspended</Tag>}
            </div>
            <div className="ol-person-sub">
              <Tooltip title="Click to copy email">
                <button
                  type="button"
                  className="ol-email-copy"
                  onClick={e => { e.stopPropagation(); void copyText(row.email, 'Email copied'); }}
                >
                  <span>{row.email}</span>
                  <CopyOutlined style={{ fontSize: 11 }} />
                </button>
              </Tooltip>
              {row.google_linked && (
                <Tooltip title="Signed up / linked with Google">
                  <GoogleOutlined style={{ color: '#475569' }} />
                </Tooltip>
              )}
            </div>
            {row.whatsapp && (
              <a
                href={`https://wa.me/${row.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ol-wa-link"
                onClick={e => e.stopPropagation()}
              >
                <WhatsAppOutlined />
                <span>{row.whatsapp}</span>
              </a>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Account',
      key: 'role',
      render: (_, row) => (
        <div>
          <span className={`ol-role-pill is-${row.role}`}>
            <i aria-hidden />
            {ROLE_LABEL[row.role] || row.role}
          </span>
          {row.organization && (
            <div className="ol-org-sub">
              <BankOutlined />
              <span>{row.organization}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Plan & access',
      key: 'access',
      render: (_, row) => <AccessBadge row={row} />,
    },
    {
      title: 'Request',
      key: 'request',
      render: (_, row) => row.request_id ? (
        <Tooltip title={row.request_message || 'No message attached'}>
          <div>
            <span className="ol-req-pill">Asked {fmtDate(row.requested_at, L)}</span>
            {row.request_message && <div className="ol-req-msg">“{row.request_message}”</div>}
          </div>
        </Tooltip>
      ) : (
        <span style={{ color: 'var(--ol-subtle)' }}>—</span>
      ),
    },
    {
      title: 'Joined',
      key: 'joined',
      render: (_, row) => (
        <div className="ol-when">
          <span>{fmtDate(row.created_at, L)}</span>
          <em>
            {row.signup_source === 'google' ? 'Google sign-up' : row.signup_source === 'email' ? 'Email sign-up' : ago(row.created_at, enTr)}
          </em>
        </div>
      ),
    },
    {
      title: 'Last active',
      key: 'seen',
      render: (_, row) => row.last_seen_at ? (
        <div className="ol-when">
          <span>{fmtDate(row.last_seen_at, L)}</span>
          <em>{ago(row.last_seen_at, enTr)}</em>
        </div>
      ) : (
        <div className="ol-when">
          <span style={{ color: 'var(--ol-subtle)' }}>—</span>
          <em>Not yet</em>
        </div>
      ),
    },
    {
      title: '',
      key: 'go',
      align: 'right',
      width: 110,
      render: (_, row) => (
        <div className="ol-row-actions" onClick={e => e.stopPropagation()}>
          <Button size="small" onClick={() => setOpen(row.id)}>Manage</Button>
        </div>
      ),
    },
  ], [copyText]);

  const s = data?.stats;
  const kpiTiles: {
    key: string;
    label: string;
    value: number;
    sub: string;
    tone: string;
    icon: ReactNode;
    active: boolean;
    onClick: () => void;
  }[] = s ? [
    {
      key: 'learners',
      label: 'Website learners',
      value: s.learners,
      sub: `+${s.new_week} joined this week`,
      tone: 'indigo',
      icon: <UserOutlined />,
      active: view === 'people' && filter === 'learners',
      onClick: () => { setView('people'); setFilter(filter === 'learners' ? 'all' : 'learners'); setPage(1); },
    },
    {
      key: 'active7d',
      label: 'Active (7 days)',
      value: s.active_7d ?? s.new_week,
      sub: `${s.total_people ?? s.learners} total accounts`,
      tone: 'blue',
      icon: <FieldTimeOutlined />,
      active: view === 'people' && sort === 'seen_desc',
      onClick: () => { setView('people'); setSort(sort === 'seen_desc' ? 'recent' : 'seen_desc'); setPage(1); },
    },
    {
      key: 'paid',
      label: 'Paid plans (people)',
      value: s.premium_people,
      sub: s.standard_people !== undefined
        ? `${s.standard_people} Standard · ${s.premium_tier_people ?? s.premium_people} Premium`
        : 'Standard & Premium licenses',
      tone: 'green',
      icon: <CrownFilled />,
      active: view === 'people' && filter === 'premium',
      onClick: () => { setView('people'); setFilter(filter === 'premium' ? 'all' : 'premium'); setPage(1); },
    },
    {
      key: 'requests',
      label: 'Open requests',
      value: s.open_requests,
      sub: s.open_requests > 0 ? 'Waiting for review' : 'All caught up',
      tone: s.open_requests > 0 ? 'amber' : 'slate',
      icon: <NotificationOutlined />,
      active: view === 'people' && filter === 'requests',
      onClick: () => { setView('people'); setFilter(filter === 'requests' ? 'all' : 'requests'); setPage(1); },
    },
  ] : [];

  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#4f46e5', fontSize: 13, borderRadius: 8 } }}>
      <div className="ol">
        {/* ── Header ── */}
        <header className="ol-header">
          <div>
            <div className="ol-overline">Admin console · Online Academy</div>
            <h1 className="ol-title">Online courses</h1>
            <p className="ol-subtitle">
              Manage course access mode, learner accounts, company licenses, subscription plans, and Paystack transactions.
            </p>
          </div>
          <div className="ol-header-actions">
            {view === 'people' && (
              <Button
                icon={<DownloadOutlined />}
                onClick={exportCsv}
                disabled={!data?.rows?.length}
              >
                {r.isMobile ? 'CSV' : 'Export CSV'}
              </Button>
            )}
            <Button icon={<ExportOutlined />} href="/learn/" target="_blank" rel="noopener noreferrer">
              {r.isMobile ? 'Academy' : 'Open Academy'}
            </Button>
            {view !== 'payments' && (
              <Button icon={<ReloadOutlined />} onClick={() => (view === 'people' ? void load() : void loadOrgs())}>
                Refresh
              </Button>
            )}
          </div>
        </header>

        {/* ── Website Mode Switcher ── */}
        <CoursesModeSwitch onModeChange={setLearnMode} />

        {/* ── Clickable KPI Strip ── */}
        {s && (
          <section className="ol-kpis" aria-label="Academy overview">
            {kpiTiles.map(tile => (
              <button
                key={tile.key}
                type="button"
                className={`ol-tile ol-k-${tile.tone}${tile.active ? ' is-active' : ''}`}
                onClick={tile.onClick}
                aria-pressed={tile.active}
              >
                <div className="ol-tile-top">
                  <span className="ol-tile-ic" aria-hidden>{tile.icon}</span>
                  <ArrowRightOutlined className="ol-tile-go" aria-hidden />
                </div>
                <div className="ol-tile-body">
                  <span className="ol-tile-label">{tile.label}</span>
                  <strong className="ol-tile-val">{tile.value.toLocaleString('en-US')}</strong>
                  <span className="ol-tile-sub">{tile.sub}</span>
                </div>
              </button>
            ))}
          </section>
        )}

        {/* ── Primary Workspace Tabs ── */}
        <div className="ol-nav-bar">
          <div className="ol-nav-tabs" role="tablist" aria-label="Online courses sections">
            <button
              type="button"
              role="tab"
              aria-selected={view === 'people'}
              className={`ol-nav-tab${view === 'people' ? ' is-active' : ''}`}
              onClick={() => setView('people')}
            >
              <TeamOutlined />
              <span>People</span>
              {s && <span className="ol-nav-count">{s.total_people ?? s.learners}</span>}
              {s && s.open_requests > 0 && (
                <span className="ol-nav-count is-warn" title="Open access requests">{s.open_requests} req</span>
              )}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={view === 'companies'}
              className={`ol-nav-tab${view === 'companies' ? ' is-active' : ''}`}
              onClick={() => setView('companies')}
            >
              <BankOutlined />
              <span>Companies</span>
              {orgs && <span className="ol-nav-count">{orgs.length}</span>}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={view === 'payments'}
              className={`ol-nav-tab${view === 'payments' ? ' is-active' : ''}`}
              onClick={() => setView('payments')}
            >
              <CreditCardOutlined />
              <span>Plans &amp; payments</span>
            </button>
          </div>
        </div>

        {/* ── Workspace Content ── */}
        {view === 'people' ? (
          <section className="ol-panel" aria-label="People directory">
            <div className="ol-toolbar">
              <Segmented
                value={filter}
                onChange={v => { setFilter(v as Filter); setPage(1); }}
                options={[
                  { label: 'All', value: 'all' },
                  { label: 'Website learners', value: 'learners' },
                  { label: 'Students & companies', value: 'portal' },
                  { label: 'Paid plans', value: 'premium' },
                  {
                    label: (
                      <span className="ol-seg">
                        <span>Requests</span>
                        {s && s.open_requests > 0 && <b>{s.open_requests}</b>}
                      </span>
                    ),
                    value: 'requests',
                  },
                ]}
              />
              <Input
                allowClear
                className="ol-search"
                prefix={<SearchOutlined />}
                placeholder="Search name, email, WhatsApp or company"
                value={q}
                onChange={e => setQ(e.target.value)}
              />
            </div>

            <div className="ol-filters">
              <Select
                value={tierFilter}
                className="ol-filter-sel"
                onChange={v => { setTierFilter(v as TierFilter); setPage(1); }}
                options={[
                  { value: '', label: 'Access: All tiers' },
                  { value: 'premium', label: 'Premium plan' },
                  { value: 'standard', label: 'Standard plan' },
                  { value: 'free', label: 'Free website access' },
                  { value: 'off', label: 'Website off' },
                ]}
              />
              <Select
                value={levelFilter}
                className="ol-filter-sel"
                onChange={v => { setLevelFilter(v as LevelFilter); setPage(1); }}
                options={[
                  { value: '', label: 'Level: All CEFR' },
                  { value: 'beginner', label: 'Beginner' },
                  { value: 'A1', label: 'A1' },
                  { value: 'A2', label: 'A2' },
                  { value: 'B1', label: 'B1' },
                  { value: 'B2', label: 'B2' },
                  { value: 'C1', label: 'C1' },
                  { value: 'C2', label: 'C2' },
                  { value: 'none', label: 'Level not set' },
                ]}
              />
              <Select
                value={sourceFilter}
                className="ol-filter-sel"
                onChange={v => { setSourceFilter(v as SourceFilter); setPage(1); }}
                options={[
                  { value: '', label: 'Source: All accounts' },
                  { value: 'google', label: 'Google sign-up' },
                  { value: 'email', label: 'Email sign-up' },
                  { value: 'portal', label: 'Portal / Company' },
                ]}
              />
              <Select
                value={sort}
                className="ol-sort-sel"
                onChange={v => { setSort(v as SortKey); setPage(1); }}
                options={[
                  { value: 'recent', label: 'Sort: Requests & newest' },
                  { value: 'seen_desc', label: 'Sort: Recently active' },
                  { value: 'joined_desc', label: 'Sort: Newest joined' },
                  { value: 'joined_asc', label: 'Sort: Oldest joined' },
                  { value: 'name_asc', label: 'Sort: Name A → Z' },
                ]}
              />
              {hasExtraFilters && (
                <Button size="small" onClick={resetFilters}>Reset filters</Button>
              )}
              <span className="ol-count">
                {data ? `${data.total.toLocaleString('en-US')} ${data.total === 1 ? 'person' : 'people'}` : 'Loading…'}
              </span>
            </div>

            {r.isMobile ? (
              loading && !data ? (
                <div style={{ padding: 16 }}><Skeleton active paragraph={{ rows: 6 }} /></div>
              ) : !data?.rows.length ? (
                <div className="ol-empty">
                  <span className="ol-empty-ic"><UserOutlined /></span>
                  <strong>No matching people</strong>
                  <span>{hasExtraFilters ? 'Try clearing one of your active filters.' : 'Website learners will appear here when they sign up.'}</span>
                  {hasExtraFilters && <Button size="small" onClick={resetFilters}>Clear filters</Button>}
                </div>
              ) : (
                <div className="ol-cards">
                  {data.rows.map(row => (
                    <div
                      key={row.id}
                      className={`ol-card${row.request_id ? ' is-request' : ''}`}
                      onClick={() => setOpen(row.id)}
                    >
                      <div className="ol-card-top">
                        <div className="ol-person">
                          <span className={`ol-avatar is-${row.role}`}>{initials(row.first_name, row.last_name, row.email)}</span>
                          <div className="ol-person-text">
                            <div className="ol-person-name">
                              <span>{row.first_name} {row.last_name}</span>
                              {row.french_level && <span className={`ol-level-pill ${levelTone(row.french_level)}`}>{levelText(row.french_level)}</span>}
                            </div>
                            <span style={{ fontSize: 12, color: 'var(--ol-muted)' }}>{row.email}</span>
                          </div>
                        </div>
                        <RightOutlined style={{ color: 'var(--ol-subtle)', fontSize: 12 }} />
                      </div>
                      <div className="ol-card-meta">
                        <AccessBadge row={row} />
                        <span className={`ol-role-pill is-${row.role}`}><i aria-hidden />{ROLE_LABEL[row.role] || row.role}</span>
                      </div>
                      {(row.request_id || row.whatsapp) && (
                        <div className="ol-card-meta">
                          {row.request_id ? <span className="ol-req-pill">Asked {fmtDate(row.requested_at, L)}</span> : <span />}
                          {row.whatsapp && (
                            <a
                              href={`https://wa.me/${row.whatsapp.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ol-wa-link"
                              onClick={e => e.stopPropagation()}
                            >
                              <WhatsAppOutlined /> {row.whatsapp}
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {(data.total || 0) > limit && (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 12 }}>
                      <Button onClick={() => setLimit(n => n + 25)}>Show more</Button>
                    </div>
                  )}
                </div>
              )
            ) : (
              <Table<Row>
                className="ol-table"
                rowKey="id"
                columns={columns}
                dataSource={data?.rows || []}
                loading={loading}
                sticky={{ offsetHeader: headerHeight(r.isMobile) }}
                scroll={{ x: 980 }}
                onRow={row => ({
                  onClick: () => setOpen(row.id),
                  className: `ol-row${row.request_id ? ' is-request' : ''}${!row.is_active ? ' is-suspended' : ''}`,
                })}
                pagination={{
                  current: page,
                  pageSize: limit,
                  total: data?.total || 0,
                  showSizeChanger: true,
                  pageSizeOptions: ['25', '50', '100'],
                  showTotal: (total, [a, b]) => `${a}–${b} of ${total}`,
                  onChange: (nextPage, nextSize) => {
                    setPage(nextSize !== limit ? 1 : nextPage);
                    setLimit(nextSize);
                  },
                }}
                locale={{
                  emptyText: (
                    <div className="ol-empty">
                      <span className="ol-empty-ic"><UserOutlined /></span>
                      <strong>No people match these filters</strong>
                      <span>{hasExtraFilters ? 'Adjust or clear your filters to see everyone.' : 'Website sign-ups will show up here.'}</span>
                      {hasExtraFilters && <Button size="small" onClick={resetFilters}>Clear filters</Button>}
                    </div>
                  ),
                }}
              />
            )}
          </section>
        ) : view === 'companies' ? (
          <Companies orgs={orgs} reload={loadOrgs} isMobile={r.isMobile} />
        ) : (
          <BillingAdmin learnMode={learnMode} />
        )}

        <PersonDrawer id={open} onClose={() => setOpen(null)} onChanged={() => void load()} isMobile={r.isMobile} />
      </div>
    </ConfigProvider>
  );
}

/** Plan license: Standard or Premium, end date presets (or custom / none) and a reason. */
function GrantPremium({ onGrant, busy }: { onGrant: (tier: PlanTier, endsAt: string | null, reason: string) => void; busy: boolean }) {
  const [tier, setTier] = useState<PlanTier>('premium');
  const [end, setEnd] = useState<Dayjs | null>(dayjs().add(1, 'month'));
  const [noEnd, setNoEnd] = useState(false);
  const [reason, setReason] = useState('');

  const pickDuration = (months: number) => {
    setNoEnd(false);
    setEnd(dayjs().add(months, 'month'));
  };

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <Segmented
        block
        value={tier}
        onChange={v => setTier(v as PlanTier)}
        options={[
          { label: 'Standard (Courses)', value: 'standard' },
          { label: 'Premium (Courses + Exams)', value: 'premium' },
        ]}
      />
      <div className="ol-presets">
        <button type="button" className="ol-preset-btn" onClick={() => pickDuration(1)}>+1 month</button>
        <button type="button" className="ol-preset-btn" onClick={() => pickDuration(3)}>+3 months</button>
        <button type="button" className="ol-preset-btn" onClick={() => pickDuration(12)}>+1 year</button>
        <button type="button" className="ol-preset-btn" onClick={() => setNoEnd(true)}>No end date</button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        <DatePicker
          value={end}
          onChange={setEnd}
          disabled={noEnd}
          disabledDate={d => d.isBefore(dayjs().add(1, 'day'), 'day')}
          format="YYYY-MM-DD"
          style={{ flex: 1, minWidth: 160 }}
        />
        <Checkbox checked={noEnd} onChange={e => setNoEnd(e.target.checked)}>Lifetime / No end</Checkbox>
      </div>
      <Input
        placeholder="Reason (e.g. paid by bank transfer, scholarship)"
        value={reason}
        onChange={e => setReason(e.target.value)}
        maxLength={300}
      />
      <Button
        type="primary"
        icon={<CrownFilled />}
        loading={busy}
        disabled={!noEnd && !end}
        onClick={() => onGrant(tier, noEnd ? null : end!.endOf('day').toISOString(), reason)}
      >
        Activate {tier === 'standard' ? 'Standard' : 'Premium'}
      </Button>
    </div>
  );
}

function PersonDrawer({ id, onClose, onChanged, isMobile }: { id: number | null; onClose: () => void; onChanged: () => void; isMobile: boolean }) {
  const { apiCall } = useAuth();
  const { message } = App.useApp();
  const [d, setD] = useState<Detail | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setD(null);
    try {
      setD(await call<Detail>(apiCall, `/admin/learners/${id}`));
    } catch (e) {
      message.error((e as Error).message);
    }
  }, [id, apiCall, message]);
  useEffect(() => { void load(); }, [load]);

  const act = async (fn: () => Promise<unknown>, done: string) => {
    setBusy(true);
    try {
      await fn();
      message.success(done);
      await load();
      onChanged();
    } catch (e) {
      message.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const u = d?.user;
  const openRequest = d?.requests.find(r => r.status === 'open');
  const portal = u && u.role !== 'learner';
  const copyEmail = async (email: string) => {
    try { await navigator.clipboard.writeText(email); message.success('Email copied'); } catch { message.error('Clipboard unavailable'); }
  };

  return (
    <Drawer
      open={!!id}
      onClose={onClose}
      width={isMobile ? '100%' : 520}
      closable={false}
      title={null}
      rootClassName="ol-drawer"
      destroyOnHidden
    >
      {!d || !u ? (
        <div style={{ padding: 24 }}><Skeleton active avatar paragraph={{ rows: 8 }} /></div>
      ) : (
        <div className="ol-detail">
          <div className={`ol-dh is-${u.role}`}>
            <button type="button" className="ol-dclose" onClick={onClose} aria-label="Close">
              <CloseOutlined />
            </button>
            <span className={`ol-avatar is-lg is-${u.role}`} aria-hidden>{initials(u.first_name, u.last_name, u.email)}</span>
            <h3>{u.first_name} {u.last_name}</h3>
            <p>{u.email}</p>
            <div className="ol-dh-badges">
              <span className={`ol-role-pill is-${u.role}`}><i aria-hidden />{ROLE_LABEL[u.role] || u.role}</span>
              {u.email_verified ? <Tag color="green">Verified</Tag> : <Tag>Unverified</Tag>}
              {u.google_linked && <Tag icon={<GoogleOutlined />}>Google</Tag>}
              {!u.is_active && <Tag color="red">Suspended</Tag>}
            </div>
            <div className="ol-dh-actions">
              <button type="button" className="ol-chip-btn" onClick={() => void copyEmail(u.email)}>
                <CopyOutlined /> Copy email
              </button>
              <a className="ol-chip-btn" href={`mailto:${u.email}`}>
                <MailOutlined /> Email
              </a>
              {u.whatsapp && (
                <a
                  className="ol-chip-btn is-wa"
                  href={`https://wa.me/${u.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <WhatsAppOutlined /> {u.whatsapp}
                </a>
              )}
            </div>
          </div>

          <div className="ol-dbody">
            <div className="ol-meta-grid">
              <div className="ol-meta-box">
                <span>French level</span>
                <strong>{u.french_level ? levelText(u.french_level) : 'Not set'}</strong>
              </div>
              <div className="ol-meta-box">
                <span>Joined</span>
                <strong>{fmtDate(u.created_at, L)}</strong>
              </div>
              <div className="ol-meta-box">
                <span>Signed-in devices</span>
                <strong>{d.devices} active device{d.devices === 1 ? '' : 's'}</strong>
              </div>
              <div className="ol-meta-box">
                <span>30-day activity</span>
                <strong>{d.lessons_opened_30d} protected loads</strong>
              </div>
            </div>

            {(u.country || u.lang || u.organization) && (
              <div className="ol-dcard">
                <h4>Profile context</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 12.5, color: 'var(--ol-text)' }}>
                  {u.organization && <span><BankOutlined /> Company: <strong>{u.organization.name}</strong></span>}
                  {u.country && <span><GlobalOutlined /> {u.country}</span>}
                  {u.lang && <span>Interface: <strong>{u.lang.toUpperCase()}</strong></span>}
                  <span>Marketing emails: <strong>{u.marketing_opt_in ? 'Opted in' : 'No'}</strong></span>
                </div>
              </div>
            )}

            <div className="ol-dcard">
              <h4>Current website access</h4>
              {d.access.level === 'premium' ? (() => {
                const isStd = (d.access.plan || d.access.premium?.tier) === 'standard';
                return (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <span className={`ol-access-pill ${isStd ? 'is-standard' : 'is-premium'}`}>
                      {!isStd && <CrownFilled />}
                      {isStd ? 'Standard Plan' : 'Premium Plan'}
                    </span>
                    <span style={{ fontSize: 12.5, color: 'var(--ol-muted)' }}>
                      {d.access.premium?.until ? `Active until ${fmtDate(d.access.premium.until, L)}` : 'No end date'}
                      {d.access.premium?.via === 'company' ? ' (via company)' : ''}
                    </span>
                  </div>
                );
              })() : d.access.website ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <span className="ol-access-pill is-free">Free account</span>
                  <span style={{ fontSize: 12.5, color: 'var(--ol-muted)' }}>Starter Module 1 access across A1–C2 paths</span>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <span className="ol-access-pill is-off">Website off</span>
                  <span style={{ fontSize: 12.5, color: 'var(--ol-muted)' }}>Student / company portal only</span>
                </div>
              )}

              {openRequest && (
                <div className="ol-req-box">
                  <strong>Requested access on {fmtDate(openRequest.created_at, L)}</strong>
                  {openRequest.message && <p>“{openRequest.message}”</p>}
                  <Button
                    size="small"
                    style={{ marginTop: 8 }}
                    disabled={busy}
                    onClick={() => void act(() => call(apiCall, `/admin/learners/requests/${openRequest.id}/dismiss`, 'POST', {}), 'Request dismissed')}
                  >
                    Dismiss request
                  </Button>
                </div>
              )}
            </div>

            <div className="ol-dcard">
              <h4>Activate or change plan license</h4>
              <GrantPremium
                busy={busy}
                onGrant={(tier, endsAt, reason) =>
                  void act(() => call(apiCall, `/admin/learners/${u.id}/premium`, 'POST', { tier, ends_at: endsAt, reason }), `${tier === 'standard' ? 'Standard' : 'Premium'} activated`)
                }
              />
              {d.licenses.some(l => l.active && !l.via_company) && (
                <Popconfirm
                  title="End this person’s active plan now?"
                  okText="End Plan"
                  okButtonProps={{ danger: true }}
                  onConfirm={() => void act(() => call(apiCall, `/admin/learners/${u.id}/premium/revoke`, 'POST', { reason: 'Ended by an administrator' }), 'Plan ended')}
                >
                  <Button danger block style={{ marginTop: 10 }} icon={<StopOutlined />} disabled={busy}>
                    End active plan now
                  </Button>
                </Popconfirm>
              )}
            </div>

            {portal && (
              <div className="ol-dcard">
                <h4>Portal website access</h4>
                <p style={{ color: 'var(--ol-muted)', fontSize: 12.5, margin: '0 0 10px' }}>
                  Controls whether this student or company account can also sign in on the website.{u.organization ? ` Company default: “${u.organization.learn_access}”.` : ''}
                </p>
                <Select
                  value={u.learn_access}
                  style={{ width: '100%' }}
                  disabled={busy}
                  onChange={v => void act(() => call(apiCall, `/admin/learners/${u.id}/website`, 'PUT', { learn_access: v }), 'Website access saved')}
                  options={[
                    { value: 'off', label: 'Off (portal only)' },
                    { value: 'free', label: 'Free website account (Module 1 starter paths)' },
                  ]}
                />
              </div>
            )}

            {u.role === 'learner' && (
              <div className="ol-dcard" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <h4 style={{ margin: 0 }}>Account status</h4>
                  <span style={{ fontSize: 12.5, color: 'var(--ol-muted)' }}>
                    {u.is_active ? 'Account active and allowed to sign in.' : 'Account is currently suspended.'}
                  </span>
                </div>
                <Popconfirm
                  title={u.is_active ? 'Suspend this account? They are signed out at once.' : 'Restore this account?'}
                  onConfirm={() => void act(() => call(apiCall, `/admin/learners/${u.id}/active`, 'PUT', { is_active: !u.is_active }), u.is_active ? 'Account suspended' : 'Account restored')}
                >
                  <Button danger={u.is_active} disabled={busy}>{u.is_active ? 'Suspend' : 'Restore'}</Button>
                </Popconfirm>
              </div>
            )}

            <div className="ol-dcard">
              <h4>Activity history</h4>
              {d.history.length === 0 ? (
                <p style={{ color: 'var(--ol-subtle)', margin: 0 }}>No events recorded yet.</p>
              ) : (
                <Timeline
                  items={d.history.map((h, idx) => ({
                    key: `${h.action}-${h.created_at}-${idx}`,
                    children: (
                      <div>
                        <strong style={{ color: 'var(--ol-ink)' }}>{ACTION_LABEL[h.action] || h.action}</strong>
                        <span style={{ color: 'var(--ol-muted)' }}> · {fmtDate(h.created_at, L)}{h.actor_name ? ` · by ${h.actor_name}` : ''}</span>
                        {h.detail?.reason ? <div style={{ color: 'var(--ol-muted)', fontSize: 12 }}>{String(h.detail.reason)}</div> : null}
                        {h.detail?.ends_at !== undefined && h.action === 'premium_granted' && (
                          <div style={{ color: 'var(--ol-subtle)', fontSize: 12 }}>
                            {h.detail.ends_at ? `Until ${fmtDate(String(h.detail.ends_at), L)}` : 'No end date'}
                          </div>
                        )}
                      </div>
                    ),
                  }))}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
}

function Companies({ orgs, reload, isMobile }: { orgs: Org[] | null; reload: () => void; isMobile: boolean }) {
  const { apiCall } = useAuth();
  const { message, modal } = App.useApp();
  const [search, setSearch] = useState('');
  const [accessFilter, setAccessFilter] = useState<OrgAccessFilter>('all');

  const filteredOrgs = useMemo(() => {
    if (!orgs) return [];
    const term = search.trim().toLowerCase();
    return orgs.filter(o => {
      if (term && !o.name.toLowerCase().includes(term)) return false;
      if (accessFilter === 'paid' && !o.premium) return false;
      if (accessFilter === 'free' && (o.premium || o.learn_access !== 'free')) return false;
      if (accessFilter === 'off' && (o.premium || o.learn_access !== 'off')) return false;
      return true;
    });
  }, [orgs, search, accessFilter]);

  if (!orgs) {
    return (
      <section className="ol-panel" style={{ padding: 20 }}>
        <Skeleton active paragraph={{ rows: 5 }} />
      </section>
    );
  }

  const save = async (fn: () => Promise<unknown>, done: string) => {
    try { await fn(); message.success(done); reload(); } catch (e) { message.error((e as Error).message); }
  };

  const grant = (o: Org) => {
    let tier: PlanTier = o.premium_tier === 'standard' ? 'standard' : 'premium';
    let endsAt: string | null = dayjs().add(1, 'year').endOf('day').toISOString();
    let reason = '';
    modal.confirm({
      title: `Plan access for all learners of ${o.name}`,
      icon: <CrownFilled style={{ color: '#b45309' }} />,
      width: 480,
      className: 'ol-modal',
      content: (
        <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
          <div>
            <div className="ol-param-label">Plan Tier</div>
            <Select
              defaultValue={tier}
              style={{ width: '100%' }}
              onChange={v => { tier = v as PlanTier; }}
              options={[
                { value: 'standard', label: 'Standard (All courses & labs only)' },
                { value: 'premium', label: 'Premium (Courses + Exam Simulator & AI)' },
              ]}
            />
          </div>
          <div>
            <div className="ol-param-label">End date (leave empty for no expiry)</div>
            <DatePicker
              defaultValue={dayjs().add(1, 'year')}
              format="YYYY-MM-DD"
              style={{ width: '100%' }}
              disabledDate={d => d.isBefore(dayjs().add(1, 'day'), 'day')}
              onChange={d => { endsAt = d ? d.endOf('day').toISOString() : null; }}
            />
          </div>
          <div>
            <div className="ol-param-label">Note / Reason</div>
            <Input placeholder="e.g. Annual company package" onChange={e => { reason = e.target.value; }} maxLength={300} />
          </div>
        </div>
      ),
      okText: 'Activate Plan',
      onOk: () => save(() => call(apiCall, `/admin/learners/organizations/${o.id}/premium`, 'POST', { tier, ends_at: endsAt, reason }), 'Plan activated for the company'),
    });
  };

  return (
    <section className="ol-panel" aria-label="Companies directory">
      <div className="ol-toolbar">
        <Segmented
          value={accessFilter}
          onChange={v => setAccessFilter(v as OrgAccessFilter)}
          options={[
            { label: `All (${orgs.length})`, value: 'all' },
            { label: 'Paid plans', value: 'paid' },
            { label: 'Free access', value: 'free' },
            { label: 'Website off', value: 'off' },
          ]}
        />
        <Input
          allowClear
          className="ol-search"
          prefix={<SearchOutlined />}
          placeholder="Search company name"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <Table<Org>
        className="ol-table"
        rowKey="id"
        dataSource={filteredOrgs}
        pagination={false}
        sticky={{ offsetHeader: headerHeight(isMobile) }}
        scroll={{ x: 760 }}
        locale={{
          emptyText: (
            <div className="ol-empty">
              <span className="ol-empty-ic"><BankOutlined /></span>
              <strong>No matching companies</strong>
              <span>Try clearing your search or filter.</span>
            </div>
          ),
        }}
        columns={[
          {
            title: 'Company',
            key: 'name',
            render: (_, o) => (
              <div className="ol-person">
                <span className="ol-avatar is-org_admin" aria-hidden>{initials(o.name, '', o.name)}</span>
                <div className="ol-person-text">
                  <div className="ol-person-name">
                    <span>{o.name}</span>
                    {o.status === 'suspended' && <Tag color="red" style={{ margin: 0 }}>Suspended</Tag>}
                  </div>
                  <div className="ol-person-sub">
                    <span>{o.accounts} {o.accounts === 1 ? 'account' : 'accounts'}</span>
                  </div>
                </div>
              </div>
            ),
          },
          {
            title: 'Website access (all learners)',
            key: 'access',
            render: (_, o) => (
              <Select
                value={o.learn_access}
                style={{ width: 210 }}
                onChange={v => void save(() => call(apiCall, `/admin/learners/organizations/${o.id}/website`, 'PUT', { learn_access: v }), 'Website access saved')}
                options={[
                  { value: 'off', label: 'Off (portal only)' },
                  { value: 'free', label: 'Free website account' },
                ]}
              />
            ),
          },
          {
            title: 'Company plan',
            key: 'premium',
            render: (_, o) => o.premium ? (
              <div className="ol-access-cell">
                <span className={`ol-access-pill ${o.premium_tier === 'standard' ? 'is-standard' : 'is-premium'}`}>
                  {o.premium_tier !== 'standard' && <CrownFilled aria-hidden />}
                  {o.premium_tier === 'standard' ? 'Standard' : 'Premium'}
                </span>
                <span className="ol-access-sub">{o.premium_until ? `Until ${fmtDate(o.premium_until, L)}` : 'No end date'}</span>
              </div>
            ) : (
              <span className="ol-access-pill is-off">No company plan</span>
            ),
          },
          {
            title: '',
            key: 'go',
            align: 'right',
            render: (_, o) => (
              <span className="ol-row-actions">
                <Button size="small" onClick={() => grant(o)} icon={<CrownFilled />}>
                  {o.premium ? 'Change plan' : 'Activate plan'}
                </Button>
                {o.premium && (
                  <Popconfirm
                    title={`End company plan for ${o.name}?`}
                    okButtonProps={{ danger: true }}
                    onConfirm={() => void save(() => call(apiCall, `/admin/learners/organizations/${o.id}/premium/revoke`, 'POST', { reason: 'Ended by an administrator' }), 'Company plan ended')}
                  >
                    <Button size="small" danger>End</Button>
                  </Popconfirm>
                )}
              </span>
            ),
          },
        ]}
      />
    </section>
  );
}
