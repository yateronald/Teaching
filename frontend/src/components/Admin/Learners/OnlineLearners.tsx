// The website's courses, for the administrator: who signed up, who may use the
// website, who has Premium, and the Premium requests. Premium is granted by
// hand here until online payment exists (every change is kept in the history).
import { useCallback, useEffect, useMemo, useState } from 'react';
import { App, Button, Checkbox, DatePicker, Drawer, Empty, Input, Popconfirm, Segmented, Select, Skeleton, Table, Tag, Timeline, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { BankOutlined, CrownFilled, GoogleOutlined, MailOutlined, ReloadOutlined, SearchOutlined, StopOutlined, UserOutlined } from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';
import { useAuth } from '../../../contexts/AuthContext';
import { call, fmtDate } from '../../Org/orgModel';
import BillingAdmin from './BillingAdmin';
import CoursesModeSwitch from './CoursesModeSwitch';

type Filter = 'all' | 'learners' | 'portal' | 'premium' | 'requests';

interface Row {
  id: number; first_name: string; last_name: string; email: string; role: string; is_active: boolean; created_at: string;
  signup_source: string | null; email_verified: boolean; learn_access: 'off' | 'free'; country: string | null; google_linked: boolean;
  organization_id: number | null; organization: string | null; organization_access: 'off' | 'free' | null;
  premium: boolean; premium_until: string | null; premium_source: string | null; premium_via_company: boolean;
  request_id: number | null; requested_at: string | null; request_message: string | null; last_seen_at: string | null;
}
interface ListAnswer { rows: Row[]; total: number; page: number; limit: number; stats: { learners: number; new_week: number; premium_people: number; open_requests: number } }
interface Detail {
  user: { id: number; first_name: string; last_name: string; email: string; role: string; is_active: boolean; created_at: string; signup_source: string | null; email_verified: boolean; google_linked: boolean; country: string | null; lang: string | null; marketing_opt_in: boolean; learn_access: 'off' | 'free'; organization: { id: number; name: string; learn_access: string } | null };
  access: { level: 'visitor' | 'free' | 'premium'; website: boolean; premium: { until: string | null; via: string } | null };
  licenses: { id: number; source: string; starts_at: string; ends_at: string | null; reason: string | null; created_at: string; revoked_at: string | null; revoke_reason: string | null; via_company: boolean; active: boolean; created_by_name: string | null }[];
  history: { action: string; detail: Record<string, unknown> | null; created_at: string; actor_name: string | null }[];
  requests: { id: number; message: string | null; status: string; created_at: string }[];
  devices: number;
  lessons_opened_30d: number;
}
interface Org { id: number; name: string; status: string; learn_access: 'off' | 'free'; accounts: number; premium: boolean; premium_until: string | null }

const ROLE_LABEL: Record<string, string> = { learner: 'Website learner', student: 'Student', candidate: 'Company learner', org_admin: 'Company manager' };
const ACTION_LABEL: Record<string, string> = {
  signup: 'Signed up', premium_granted: 'Premium granted', premium_revoked: 'Premium ended', premium_requested: 'Asked for Premium',
  premium_request_dismissed: 'Request dismissed', website_access: 'Website access changed', google_linked: 'Google sign-in added',
  google_unlinked: 'Google sign-in removed', password_changed: 'Password changed', password_reset: 'Password reset', suspended: 'Suspended', restored: 'Restored',
};
const L = 'en-CA';

export default function OnlineLearners() {
  const { apiCall } = useAuth();
  const { message } = App.useApp();
  const [view, setView] = useState<'people' | 'companies' | 'payments'>('people');
  const [filter, setFilter] = useState<Filter>('all');
  const [q, setQ] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ListAnswer | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const [orgs, setOrgs] = useState<Org[] | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ filter, page: String(page), limit: '25', ...(query ? { q: query } : {}) });
      setData(await call<ListAnswer>(apiCall, `/admin/learners?${params}`));
    } catch (e) {
      message.error((e as Error).message || 'Could not load the list.');
    } finally {
      setLoading(false);
    }
  }, [apiCall, filter, page, query, message]);
  const loadOrgs = useCallback(async () => {
    try { setOrgs(await call<{ rows: Org[] }>(apiCall, '/admin/learners/organizations').then(d => d.rows)); } catch (e) { message.error((e as Error).message); }
  }, [apiCall, message]);

  useEffect(() => { if (view === 'people') load(); else if (view === 'companies') loadOrgs(); }, [view, load, loadOrgs]);
  useEffect(() => { const t = setTimeout(() => { setQuery(q.trim()); setPage(1); }, 300); return () => clearTimeout(t); }, [q]);

  const columns: ColumnsType<Row> = useMemo(() => [
    {
      title: 'Person', key: 'name', render: (_, r) => (
        <div>
          <strong>{r.first_name} {r.last_name}</strong>{!r.is_active && <Tag color="red" style={{ marginLeft: 6 }}>Suspended</Tag>}
          <div style={{ color: '#64748b', fontSize: 13 }}>{r.email}{r.google_linked && <Tooltip title="Google sign-in"><GoogleOutlined style={{ marginLeft: 6 }} /></Tooltip>}</div>
        </div>
      ),
    },
    { title: 'Account', key: 'role', render: (_, r) => <span>{ROLE_LABEL[r.role] || r.role}{r.organization && <div style={{ color: '#64748b', fontSize: 12 }}><BankOutlined /> {r.organization}</div>}</span> },
    {
      title: 'Access', key: 'access', render: (_, r) => {
        if (r.premium) return <Tag color="gold" icon={<CrownFilled />}>Premium {r.premium_until ? `until ${fmtDate(r.premium_until, L)}` : '(no end)'}{r.premium_via_company ? ' · company' : ''}</Tag>;
        const website = r.role === 'learner' || r.learn_access === 'free' || r.organization_access === 'free';
        return website ? <Tag color="blue">Free</Tag> : <Tag>Website off</Tag>;
      },
    },
    {
      title: 'Premium request', key: 'request', render: (_, r) => r.request_id
        ? <Tooltip title={r.request_message || 'No message'}><Tag color="orange">Asked {fmtDate(r.requested_at, L)}</Tag></Tooltip> : null,
    },
    { title: 'Joined', key: 'joined', render: (_, r) => <span>{fmtDate(r.created_at, L)}{r.signup_source === 'google' ? ' · Google' : r.signup_source === 'email' ? ' · email' : ''}</span> },
    { title: 'Last on website', key: 'seen', render: (_, r) => (r.last_seen_at ? fmtDate(r.last_seen_at, L) : '—') },
    { title: '', key: 'go', align: 'right', render: (_, r) => <Button onClick={() => setOpen(r.id)}>Manage</Button> },
  ], []);

  const s = data?.stats;
  return (
    <div style={{ padding: 24, maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24 }}>Online courses</h1>
          <p style={{ margin: '4px 0 0', color: '#64748b' }}>Website accounts, website access of students and companies, Premium (paid online with Paystack, or activated by hand) and prices.</p>
        </div>
        {view !== 'payments' && <Button icon={<ReloadOutlined />} onClick={() => (view === 'people' ? load() : loadOrgs())}>Refresh</Button>}
      </div>

      <CoursesModeSwitch />

      {s && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, marginBottom: 16 }}>
          {[['Website learners', s.learners], ['New this week', s.new_week], ['Premium (people)', s.premium_people], ['Open Premium requests', s.open_requests]].map(([label, n]) => (
            <div key={label as string} style={{ padding: '14px 16px', border: '1px solid #e2e8f0', borderRadius: 12, background: '#fff' }}>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{n as number}</div><div style={{ color: '#64748b' }}>{label as string}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
        <Segmented value={view} onChange={v => setView(v as 'people' | 'companies' | 'payments')} options={[{ label: 'People', value: 'people' }, { label: 'Companies', value: 'companies' }, { label: 'Payments & prices', value: 'payments' }]} />
        {view === 'people' && (
          <>
            <Segmented value={filter} onChange={v => { setFilter(v as Filter); setPage(1); }} options={[
              { label: 'All', value: 'all' }, { label: 'Website learners', value: 'learners' }, { label: 'Students & companies', value: 'portal' },
              { label: 'Premium', value: 'premium' }, { label: `Requests${s?.open_requests ? ` (${s.open_requests})` : ''}`, value: 'requests' },
            ]} />
            <Input allowClear prefix={<SearchOutlined />} placeholder="Name, email or company" value={q} onChange={e => setQ(e.target.value)} style={{ maxWidth: 300 }} />
          </>
        )}
      </div>

      {view === 'people' ? (
        <Table<Row>
          rowKey="id" columns={columns} dataSource={data?.rows || []} loading={loading} scroll={{ x: 900 }}
          pagination={{ current: page, pageSize: 25, total: data?.total || 0, showSizeChanger: false, onChange: setPage }}
          locale={{ emptyText: <Empty description="No one here yet" /> }}
        />
      ) : view === 'companies' ? (
        <Companies orgs={orgs} reload={loadOrgs} />
      ) : (
        <BillingAdmin />
      )}

      <PersonDrawer id={open} onClose={() => setOpen(null)} onChanged={load} />
    </div>
  );
}

/** Premium: an end date (or none) and a reason, then grant. */
function GrantPremium({ onGrant, busy }: { onGrant: (endsAt: string | null, reason: string) => void; busy: boolean }) {
  const [end, setEnd] = useState<Dayjs | null>(dayjs().add(1, 'month'));
  const [noEnd, setNoEnd] = useState(false);
  const [reason, setReason] = useState('');
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        <DatePicker value={end} onChange={setEnd} disabled={noEnd} disabledDate={d => d.isBefore(dayjs().add(1, 'day'), 'day')} format="YYYY-MM-DD" />
        <Checkbox checked={noEnd} onChange={e => setNoEnd(e.target.checked)}>No end date</Checkbox>
      </div>
      <Input placeholder="Reason (e.g. paid by bank transfer, scholarship)" value={reason} onChange={e => setReason(e.target.value)} maxLength={300} />
      <Button type="primary" icon={<CrownFilled />} loading={busy} disabled={!noEnd && !end}
        onClick={() => onGrant(noEnd ? null : end!.endOf('day').toISOString(), reason)}>Activate Premium</Button>
    </div>
  );
}

function PersonDrawer({ id, onClose, onChanged }: { id: number | null; onClose: () => void; onChanged: () => void }) {
  const { apiCall } = useAuth();
  const { message } = App.useApp();
  const [d, setD] = useState<Detail | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setD(null);
    try { setD(await call<Detail>(apiCall, `/admin/learners/${id}`)); } catch (e) { message.error((e as Error).message); }
  }, [id, apiCall, message]);
  useEffect(() => { load(); }, [load]);

  const act = async (fn: () => Promise<unknown>, done: string) => {
    setBusy(true);
    try { await fn(); message.success(done); await load(); onChanged(); } catch (e) { message.error((e as Error).message); } finally { setBusy(false); }
  };
  const u = d?.user;
  const openRequest = d?.requests.find(r => r.status === 'open');
  const portal = u && u.role !== 'learner';

  return (
    <Drawer open={!!id} onClose={onClose} width={560} title={u ? `${u.first_name} ${u.last_name}` : 'Account'} destroyOnHidden>
      {!d || !u ? <Skeleton active /> : (
        <div style={{ display: 'grid', gap: 20 }}>
          <section>
            <p style={{ margin: 0 }}><MailOutlined /> {u.email} {u.email_verified ? <Tag color="green">verified</Tag> : <Tag>not verified</Tag>}{u.google_linked && <Tag icon={<GoogleOutlined />}>Google</Tag>}</p>
            <p style={{ margin: '6px 0 0', color: '#64748b' }}>
              <UserOutlined /> {ROLE_LABEL[u.role] || u.role}{u.organization ? ` · ${u.organization.name}` : ''} · joined {fmtDate(u.created_at, L)}
              {u.country ? ` · ${u.country}` : ''}{u.lang ? ` · ${u.lang.toUpperCase()}` : ''} · marketing {u.marketing_opt_in ? 'yes' : 'no'}
            </p>
            <p style={{ margin: '6px 0 0', color: '#64748b' }}>{d.devices} device(s) signed in · {d.lessons_opened_30d} protected course loads in 30 days</p>
          </section>

          <section style={{ padding: 14, border: '1px solid #e2e8f0', borderRadius: 12 }}>
            <h3 style={{ marginTop: 0 }}>Access now</h3>
            {d.access.level === 'premium'
              ? <p><Tag color="gold" icon={<CrownFilled />}>Premium</Tag>{d.access.premium?.until ? `until ${fmtDate(d.access.premium.until, L)}` : 'no end date'}{d.access.premium?.via === 'company' ? ' (through the company)' : ''}</p>
              : d.access.website ? <p><Tag color="blue">Free</Tag> first module of every path</p> : <p><Tag>Website off</Tag> portal only</p>}
            {openRequest && (
              <div style={{ margin: '8px 0', padding: 10, borderRadius: 8, background: '#fff7ed' }}>
                <strong>Asked for Premium on {fmtDate(openRequest.created_at, L)}</strong>
                {openRequest.message && <p style={{ margin: '4px 0 0' }}>“{openRequest.message}”</p>}
                <Button size="small" style={{ marginTop: 8 }} disabled={busy}
                  onClick={() => act(() => call(apiCall, `/admin/learners/requests/${openRequest.id}/dismiss`, 'POST', {}), 'Request dismissed')}>Dismiss the request</Button>
              </div>
            )}
          </section>

          <section>
            <h3>Premium</h3>
            <GrantPremium busy={busy} onGrant={(endsAt, reason) => act(() => call(apiCall, `/admin/learners/${u.id}/premium`, 'POST', { ends_at: endsAt, reason }), 'Premium activated')} />
            {d.licenses.some(l => l.active && !l.via_company) && (
              <Popconfirm title="End this person’s Premium now?" okText="End Premium" okButtonProps={{ danger: true }}
                onConfirm={() => act(() => call(apiCall, `/admin/learners/${u.id}/premium/revoke`, 'POST', { reason: 'Ended by an administrator' }), 'Premium ended')}>
                <Button danger style={{ marginTop: 8 }} icon={<StopOutlined />} disabled={busy}>End Premium now</Button>
              </Popconfirm>
            )}
          </section>

          {portal && (
            <section>
              <h3>Website access</h3>
              <p style={{ color: '#64748b', marginTop: 0 }}>Off: this account works in the student portal only. Free: it may also sign in on the website (first module of every path).{u.organization ? ` The company setting is “${u.organization.learn_access}”.` : ''}</p>
              <Select value={u.learn_access} style={{ width: 200 }} disabled={busy} onChange={v => act(() => call(apiCall, `/admin/learners/${u.id}/website`, 'PUT', { learn_access: v }), 'Website access saved')}
                options={[{ value: 'off', label: 'Off (portal only)' }, { value: 'free', label: 'Free account' }]} />
            </section>
          )}

          {u.role === 'learner' && (
            <section>
              <h3>Account</h3>
              <Popconfirm title={u.is_active ? 'Suspend this account? They are signed out at once.' : 'Restore this account?'}
                onConfirm={() => act(() => call(apiCall, `/admin/learners/${u.id}/active`, 'PUT', { is_active: !u.is_active }), u.is_active ? 'Account suspended' : 'Account restored')}>
                <Button danger={u.is_active} disabled={busy}>{u.is_active ? 'Suspend' : 'Restore'}</Button>
              </Popconfirm>
            </section>
          )}

          <section>
            <h3>History</h3>
            {d.history.length === 0 ? <p style={{ color: '#64748b' }}>Nothing yet.</p> : (
              <Timeline items={d.history.map(h => ({
                children: <span><strong>{ACTION_LABEL[h.action] || h.action}</strong> · {fmtDate(h.created_at, L)}{h.actor_name ? ` · by ${h.actor_name}` : ''}
                  {h.detail?.reason ? <div style={{ color: '#64748b' }}>{String(h.detail.reason)}</div> : null}
                  {h.detail?.ends_at !== undefined && h.action === 'premium_granted' ? <div style={{ color: '#64748b' }}>{h.detail.ends_at ? `until ${fmtDate(String(h.detail.ends_at), L)}` : 'no end date'}</div> : null}</span>,
              }))} />
            )}
          </section>
        </div>
      )}
    </Drawer>
  );
}

function Companies({ orgs, reload }: { orgs: Org[] | null; reload: () => void }) {
  const { apiCall } = useAuth();
  const { message, modal } = App.useApp();
  if (!orgs) return <Skeleton active />;
  const save = async (fn: () => Promise<unknown>, done: string) => {
    try { await fn(); message.success(done); reload(); } catch (e) { message.error((e as Error).message); }
  };
  const grant = (o: Org) => {
    let endsAt: string | null = dayjs().add(1, 'year').endOf('day').toISOString();
    let reason = '';
    modal.confirm({
      title: `Premium for every learner of ${o.name}`,
      icon: <CrownFilled style={{ color: '#b7791f' }} />,
      content: (
        <div style={{ display: 'grid', gap: 8, marginTop: 8 }}>
          <DatePicker defaultValue={dayjs().add(1, 'year')} format="YYYY-MM-DD" disabledDate={d => d.isBefore(dayjs().add(1, 'day'), 'day')} onChange={d => { endsAt = d ? d.endOf('day').toISOString() : null; }} />
          <small>Leave the date empty for no end date.</small>
          <Input placeholder="Reason (e.g. company package)" onChange={e => { reason = e.target.value; }} maxLength={300} />
        </div>
      ),
      okText: 'Activate Premium',
      onOk: () => save(() => call(apiCall, `/admin/learners/organizations/${o.id}/premium`, 'POST', { ends_at: endsAt, reason }), 'Premium activated for the company'),
    });
  };
  return (
    <Table<Org>
      rowKey="id" dataSource={orgs} pagination={false} scroll={{ x: 760 }}
      columns={[
        { title: 'Company', key: 'name', render: (_, o) => <span><strong>{o.name}</strong>{o.status === 'suspended' && <Tag color="red" style={{ marginLeft: 6 }}>Suspended</Tag>}<div style={{ color: '#64748b', fontSize: 12 }}>{o.accounts} account(s)</div></span> },
        {
          title: 'Website access (all its learners)', key: 'access', render: (_, o) => (
            <Select value={o.learn_access} style={{ width: 200 }} onChange={v => save(() => call(apiCall, `/admin/learners/organizations/${o.id}/website`, 'PUT', { learn_access: v }), 'Website access saved')}
              options={[{ value: 'off', label: 'Off (portal only)' }, { value: 'free', label: 'Free account' }]} />
          ),
        },
        { title: 'Premium', key: 'premium', render: (_, o) => (o.premium ? <Tag color="gold" icon={<CrownFilled />}>{o.premium_until ? `until ${fmtDate(o.premium_until, L)}` : 'no end date'}</Tag> : <Tag>No</Tag>) },
        {
          title: '', key: 'go', align: 'right', render: (_, o) => (
            <span style={{ display: 'inline-flex', gap: 8 }}>
              <Button onClick={() => grant(o)} icon={<CrownFilled />}>{o.premium ? 'Change' : 'Activate'}</Button>
              {o.premium && (
                <Popconfirm title={`End Premium for ${o.name}?`} okButtonProps={{ danger: true }}
                  onConfirm={() => save(() => call(apiCall, `/admin/learners/organizations/${o.id}/premium/revoke`, 'POST', { reason: 'Ended by an administrator' }), 'Premium ended')}>
                  <Button danger>End</Button>
                </Popconfirm>
              )}
            </span>
          ),
        },
      ]}
    />
  );
}
