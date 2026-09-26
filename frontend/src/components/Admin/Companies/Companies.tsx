import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Input, Segmented, Skeleton, Tooltip } from 'antd';
import { BankOutlined, PlusOutlined, ReloadOutlined, RightOutlined, SearchOutlined, TeamOutlined, ThunderboltOutlined, WarningOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { call, errorText, fmtDate } from '../../Org/orgModel';
import type { Company } from '../../Org/orgModel';
import { Empty, Kpi, LogoTile, PageHeader, StatePill } from '../../Org/OrgUi';
import CompanyCreate from './CompanyCreate';
import '../../Org/Org.css';

/* Administrator: every company, its state, people and credits. The admin console is in English. */

const Companies: React.FC = () => {
  const { apiCall } = useAuth();
  const navigate = useNavigate();
  const [list, setList] = useState<Company[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'soon' | 'ended'>('all');
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try { setList(await call<Company[]>(apiCall, '/admin/organizations')); }
    catch (e) { setError(errorText(e, (en: string) => en)); }
  }, [apiCall]);
  useEffect(() => { load(); }, [load]);

  const q = query.trim().toLowerCase();
  const visible = useMemo(() => (list || []).filter(c =>
    (filter === 'all'
      || (filter === 'active' && c.state === 'active')
      || (filter === 'soon' && c.state === 'active' && c.expiring_soon)
      || (filter === 'ended' && (c.state === 'expired' || c.state === 'suspended')))
    && (!q || `${c.name} ${c.display_name || ''} ${c.slug}`.toLowerCase().includes(q))), [list, filter, q]);
  const stats = useMemo(() => ({
    total: (list || []).length,
    active: (list || []).filter(c => c.state === 'active').length,
    soon: (list || []).filter(c => c.state === 'active' && c.expiring_soon).length,
    learners: (list || []).reduce((t, c) => t + c.active_learners, 0),
  }), [list]);

  return (
    <div className="og">
      <PageHeader overline="Administration" title="Companies"
        subtitle="Companies and institutions that prepare their own learners: their access dates, the exams they may use, their AI credits and their managers."
        actions={<Button type="primary" icon={<PlusOutlined />} onClick={() => setCreating(true)}>New company</Button>} />

      <div className="og-kpis">
        <Kpi icon={<BankOutlined />} label="Companies" value={stats.total} note={`${stats.active} active`} />
        <Kpi icon={<WarningOutlined />} label="Ending within 14 days" value={stats.soon} warn={stats.soon > 0} note="Extend them before the learners are cut off" />
        <Kpi icon={<TeamOutlined />} label="Active learners" value={stats.learners} note="Across all companies" />
      </div>

      <section className="og-card">
        <div className="og-toolbar">
          <Input allowClear prefix={<SearchOutlined />} placeholder="Search companies" value={query} onChange={e => setQuery(e.target.value)} />
          <Segmented value={filter} onChange={v => setFilter(v as typeof filter)} options={[
            { value: 'all', label: `All ${stats.total}` }, { value: 'active', label: 'Active' },
            { value: 'soon', label: `Ending soon ${stats.soon}` }, { value: 'ended', label: 'Expired or disabled' },
          ]} />
          <span className="og-toolbar-spacer" />
          <Tooltip title="Refresh"><Button type="text" icon={<ReloadOutlined />} onClick={load} /></Tooltip>
        </div>
        {error ? (
          <Empty icon={<WarningOutlined />} title="Companies could not be loaded" text={error} action={<Button onClick={load}>Try again</Button>} />
        ) : list === null ? (
          <div style={{ padding: 18 }}><Skeleton active paragraph={{ rows: 6 }} /></div>
        ) : visible.length === 0 ? (
          <Empty icon={<BankOutlined />} title={list.length ? 'No company matches' : 'No company yet'}
            text={list.length ? 'Try another search or filter.' : 'Create a company: give it dates, exams and credits, and its first manager receives an invitation.'}
            action={!list.length ? <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreating(true)}>New company</Button> : undefined} />
        ) : (
          <div className="og-list">
            <div className="og-row is-company is-head"><span>Company</span><span>State</span><span>Access</span><span>Package</span><span>Credits in reserve</span><span /></div>
            {visible.map(c => (
              <div key={c.id} className="og-row is-company is-link" role="link" tabIndex={0}
                onClick={() => navigate(`/app/companies/${c.id}`)} onKeyDown={e => { if (e.key === 'Enter') navigate(`/app/companies/${c.id}`); }}>
                <span className="og-company-who">
                  <LogoTile name={c.brand.name} logoUrl={c.brand.logo_url} size="sm" />
                  <span className="og-cell-main"><strong>{c.brand.name}</strong><em>{c.display_name && c.display_name !== c.name ? c.name : `/o/${c.slug}`}</em></span>
                </span>
                <span><StatePill company={c} english /></span>
                <span className="og-hide-sm og-cell-main"><strong style={{ fontWeight: 500 }}>{fmtDate(c.access_ends_at, 'en-GB')}</strong><em>from {fmtDate(c.access_starts_at, 'en-GB')}</em></span>
                <span className="og-hide-sm og-num" title={`${c.active_learners} active`}>{c.seats_used}<span className="og-muted"> / {c.seat_limit}</span></span>
                <span className="og-hide-sm og-credits"><span className="is-ee"><ThunderboltOutlined />EE {c.credits.ee.reserve}</span><span className="is-eo"><ThunderboltOutlined />EO {c.credits.eo.reserve}</span></span>
                <span className="og-muted"><RightOutlined /></span>
              </div>
            ))}
          </div>
        )}
      </section>

      <CompanyCreate open={creating} onClose={() => setCreating(false)} onCreated={id => { setCreating(false); navigate(`/app/companies/${id}`); }} />
    </div>
  );
};

export default Companies;
