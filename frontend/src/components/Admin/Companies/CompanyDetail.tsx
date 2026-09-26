import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { App as AntApp, Button, DatePicker, Drawer, Dropdown, Input, InputNumber, Modal, Popconfirm, Segmented, Skeleton, Tabs, Upload } from 'antd';
import {
  ArrowLeftOutlined, BankOutlined, CalendarOutlined, CheckCircleOutlined, CopyOutlined, DeleteOutlined, EditOutlined,
  MailOutlined, MinusOutlined, MoreOutlined, PictureOutlined, PlusOutlined, SaveOutlined, StopOutlined, TeamOutlined, ThunderboltOutlined,
  UploadOutlined, UserAddOutlined, WarningOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { FAMILY_CODE } from '../examAdminData';
import {
  call, chosenAmounts, creditName, errorText, familyOfRef, fmtDate, moveText, personName, ago,
} from '../../Org/orgModel';
import type { Company, ContentRef, CreditMove, CreditType, Learner, Person } from '../../Org/orgModel';
import ContentTreePicker from '../../Org/ContentTreePicker';
import CompanyHistory from './CompanyHistory';
import { AmountBoxes, CreditReceipt, KindPicker } from '../../Org/CreditControls';
import type { Amounts, ReceiptLine } from '../../Org/CreditControls';
import { indexTree } from '../../Org/contentTreeIndex';
import type { ContentNode } from '../../Org/contentTreeIndex';
import { Credits, Empty, Kpi, Level, LogoTile, StatePill } from '../../Org/OrgUi';
import '../../Org/Org.css';

/* Administrator: one company — extend, credits, disable, content, people, logo, history. English console. */
const en = (e: string) => e;
type Detail = Company & { content: ContentRef[]; managers: Person[] };


const CompanyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { apiCall } = useAuth();
  const { message } = AntApp.useApp();
  const navigate = useNavigate();
  const [c, setC] = useState<Detail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState('overview');
  const [extendOpen, setExtendOpen] = useState(false);
  const [creditsOpen, setCreditsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try { setC(await call<Detail>(apiCall, `/admin/organizations/${id}`)); } catch (e) { setError(errorText(e, en)); }
  }, [apiCall, id]);
  useEffect(() => { load(); }, [load]);

  if (error) return <div className="og"><Empty icon={<WarningOutlined />} title="This company could not be loaded" text={error} action={<Button onClick={() => navigate('/app/companies')}>Back to companies</Button>} /></div>;
  if (!c) return <div className="og"><Skeleton active paragraph={{ rows: 12 }} /></div>;

  const setStatus = (status: 'active' | 'suspended') => {
    const run = async () => {
      try {
        const r = await call<{ sessions_ended?: number }>(apiCall, `/admin/organizations/${c.id}/status`, 'POST', { status });
        message.success(status === 'suspended'
          ? `${c.brand.name} disabled${r.sessions_ended ? ` · ${r.sessions_ended} session(s) ended` : ''}`
          : `${c.brand.name} reactivated`);
        load();
      } catch (e) { message.error(errorText(e, en)); }
    };
    if (status === 'active') { run(); return; }
    Modal.confirm({
      title: `Disable ${c.brand.name}?`,
      content: 'Every manager and learner of this company is signed out now and can no longer sign in. Nothing is deleted: reactivating restores everyone (except learners the company itself deactivated).',
      okText: 'Disable the company', okButtonProps: { danger: true }, onOk: run,
    });
  };

  const signIn = `${window.location.origin}/o/${c.slug}`;
  return (
    <div className="og">
      <button type="button" className="og-back" onClick={() => navigate('/app/companies')}><ArrowLeftOutlined />All companies</button>
      <div className="og-hero">
        <LogoTile name={c.brand.name} logoUrl={c.brand.logo_url} size="lg" />
        <div className="og-hero-main">
          <span className="og-overline">Company</span>
          <h1 className="og-title">{c.brand.name} <StatePill company={c} english /></h1>
          <div className="og-hero-meta">
            <span><CalendarOutlined />{fmtDate(c.access_starts_at, 'en-GB')} → {fmtDate(c.access_ends_at, 'en-GB')}{c.state === 'active' ? ` · ${c.days_left} days left` : ''}</span>
            <span><TeamOutlined />Package {c.seats_used} / {c.seat_limit} accounts · {c.active_learners} active</span>
            <span>{c.default_language === 'fr' ? 'Français' : 'English'}</span>
            {c.display_name && c.display_name !== c.name && <span>Official name: {c.name}</span>}
          </div>
        </div>
        <div className="og-actions">
          <Button type="primary" icon={<CalendarOutlined />} onClick={() => setExtendOpen(true)}>Extend access</Button>
          <Button icon={<ThunderboltOutlined />} onClick={() => setCreditsOpen(true)}>Credits</Button>
          <Dropdown trigger={['click']} menu={{ items: [
            { key: 'edit', icon: <EditOutlined />, label: 'Edit details', onClick: () => setEditOpen(true) },
            { key: 'link', icon: <CopyOutlined />, label: 'Copy the sign-in link', onClick: () => navigator.clipboard?.writeText(signIn).then(() => message.success('Link copied')) },
            { type: 'divider' },
            c.status === 'suspended'
              ? { key: 'on', icon: <CheckCircleOutlined />, label: 'Reactivate the company', onClick: () => setStatus('active') }
              : { key: 'off', icon: <StopOutlined />, danger: true, label: 'Disable the company', onClick: () => setStatus('suspended') },
          ] }}>
            <Button icon={<MoreOutlined />} aria-label="More actions" />
          </Dropdown>
        </div>
      </div>

      {c.state === 'suspended' && <div className="og-banner tone-bad"><StopOutlined /><div className="og-banner-body"><strong>Disabled</strong><span>No manager or learner of this company can sign in. Reactivate it from the ⋯ menu.</span></div></div>}
      {c.state === 'expired' && <div className="og-banner tone-off"><CalendarOutlined /><div className="og-banner-body"><strong>Access ended on {fmtDate(c.access_ends_at, 'en-GB')}</strong><span>Its people can sign in and see results, but exams, assignments and credits are closed. Extend the access to reopen everything at once.</span></div></div>}

      <Tabs className="og-tabs" activeKey={tab} onChange={setTab} items={[
        { key: 'overview', label: 'Overview', children: <Overview c={c} onTab={setTab} /> },
        { key: 'learners', label: `Learners (${c.learners})`, children: <LearnersTab c={c} onChanged={load} /> },
        { key: 'managers', label: `Managers (${c.managers.length})`, children: <ManagersTab c={c} onChanged={load} /> },
        { key: 'content', label: 'Exams', children: <ContentTab c={c} onChanged={load} /> },
        { key: 'credits', label: 'Credit history', children: <CreditsTab c={c} /> },
        { key: 'brand', label: 'Logo', children: <BrandTab c={c} onChanged={load} /> },
        { key: 'audit', label: 'History & audit', children: <CompanyHistory c={c} /> },
      ]} />

      <ExtendModal open={extendOpen} c={c} onClose={() => setExtendOpen(false)} onDone={() => { setExtendOpen(false); load(); }} />
      <CreditsModal open={creditsOpen} c={c} onClose={() => setCreditsOpen(false)} onDone={() => { setCreditsOpen(false); load(); }} />
      <EditDrawer open={editOpen} c={c} onClose={() => setEditOpen(false)} onDone={() => { setEditOpen(false); load(); }} />
    </div>
  );
};

/* ── Overview ── */
const Overview: React.FC<{ c: Detail; onTab: (t: string) => void }> = ({ c, onTab }) => {
  const pot = (t: CreditType) => {
    const p = c.credits[t];
    const all = Math.max(1, p.reserve + p.with_learners + p.used);
    return (
      <div className={`og-pot fam-${t}`}>
        <div className="og-pot-head"><strong>{creditName(t, 'en')} ({t.toUpperCase()})</strong><span className="og-muted">{p.granted} granted</span></div>
        <div className="og-pot-big">{p.reserve}<small>in reserve</small></div>
        <div className="og-pot-split" aria-hidden>
          <span className="is-reserve" style={{ width: `${(p.reserve / all) * 100}%` }} />
          <span className="is-held" style={{ width: `${(p.with_learners / all) * 100}%` }} />
          <span className="is-used" style={{ width: `${(p.used / all) * 100}%` }} />
        </div>
        <div className="og-pot-legend"><span>Reserve {p.reserve}</span><span>With learners {p.with_learners}</span><span>Used {p.used}</span></div>
      </div>
    );
  };
  return (
    <div className="og" style={{ gap: 16 }}>
      <div className="og-kpis">
        <Kpi icon={<TeamOutlined />} label="Package (learner accounts)" value={`${c.seats_used} / ${c.seat_limit}`} warn={c.seats_left === 0}
          note={c.seats_left === 0 ? 'Full: raise it from “Edit details” to let the company add more' : `${c.seats_left} left · ${c.active_learners} active`} />
        <Kpi icon={<CalendarOutlined />} label="Days left" value={c.state === 'active' ? c.days_left : '—'} warn={c.expiring_soon || c.state !== 'active'} note={`until ${fmtDate(c.access_ends_at, 'en-GB')}`} />
        <Kpi icon={<BankOutlined />} label="Managers" value={c.managers.filter(m => m.is_active).length} />
      </div>
      <div className="og-pots">{pot('ee')}{pot('eo')}</div>
      <section className="og-card">
        <div className="og-card-head"><span className="og-card-title">Exams the company may use</span><Button size="small" onClick={() => onTab('content')}>Change</Button></div>
        <div className="og-card-body og-cell-tags">
          {c.content.map(x => <span key={`${x.content_type}:${x.content_id}`} className={`ea-chip is-sm fam-${familyOfRef(x)}`}><b>{FAMILY_CODE[familyOfRef(x)]}</b>{x.name}</span>)}
        </div>
      </section>
      {c.notes && <section className="og-card"><div className="og-card-head"><span className="og-card-title">Private notes</span></div><div className="og-card-body" style={{ whiteSpace: 'pre-line' }}>{c.notes}</div></section>}
    </div>
  );
};

/* ── Learners ── */
const LearnersTab: React.FC<{ c: Detail; onChanged: () => void }> = ({ c, onChanged }) => {
  const { apiCall } = useAuth();
  const { message } = AntApp.useApp();
  const [list, setList] = useState<Learner[] | null>(null);
  const [q, setQ] = useState('');
  const load = useCallback(() => { call<Learner[]>(apiCall, `/admin/organizations/${c.id}/learners`).then(setList).catch(() => setList([])); }, [apiCall, c.id]);
  useEffect(() => { load(); }, [load]);
  const act = async (l: Learner, what: 'on' | 'off' | 'invite') => {
    try {
      if (what === 'invite') {
        const r = await call<{ invitation_sent: boolean }>(apiCall, `/admin/organizations/${c.id}/accounts/${l.id}/invite`, 'POST');
        message[r.invitation_sent ? 'success' : 'warning'](r.invitation_sent ? `New invitation sent to ${l.email}` : 'Password reset, but the email could not be sent');
      } else {
        await call(apiCall, `/admin/organizations/${c.id}/accounts/${l.id}/active`, 'PUT', { active: what === 'on' });
        message.success(what === 'on' ? 'Reactivated' : 'Deactivated · unused credits returned to the company');
      }
      load(); onChanged();
    } catch (e) { message.error(errorText(e, en)); }
  };
  const visible = (list || []).filter(l => !q || `${personName(l)} ${l.email}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <section className="og-card">
      <div className="og-toolbar"><Input allowClear placeholder="Search learners" value={q} onChange={e => setQ(e.target.value)} /></div>
      {list === null ? <div style={{ padding: 18 }}><Skeleton active /></div> : visible.length === 0 ? <Empty icon={<TeamOutlined />} title="No learner" text="The company adds its learners from its own space." /> : (
        <div className="og-list">
          {visible.map(l => (
            <div key={l.id} className={`og-row is-manager${l.is_active ? '' : ' is-off'}`} style={{ gridTemplateColumns: 'minmax(200px, 2fr) 90px 120px minmax(110px, 1fr) 40px' }}>
              <span className="og-cell-main"><strong>{personName(l)}</strong><em>{l.email}{!l.is_active ? ' · deactivated' : l.invitation_pending ? ' · not signed in yet' : ''}</em></span>
              <span className="og-hide-sm"><Level nclc={l.nclc} level={Object.values(l.skills).find(Boolean) || null} /></span>
              <span className="og-hide-sm"><Credits ee={l.ee_credits} eo={l.eo_credits} /></span>
              <span className="og-hide-sm og-muted">{l.last_practice_at ? `practised ${ago(l.last_practice_at, en)}` : 'never practised'}</span>
              <Dropdown trigger={['click']} menu={{ items: l.is_active ? [
                { key: 'i', icon: <MailOutlined />, label: 'Send a new invitation', onClick: () => act(l, 'invite') },
                { key: 'off', icon: <StopOutlined />, danger: true, label: 'Deactivate', onClick: () => act(l, 'off') },
              ] : [{ key: 'on', icon: <CheckCircleOutlined />, label: 'Reactivate', onClick: () => act(l, 'on') }] }}>
                <Button type="text" size="small" icon={<MoreOutlined />} aria-label="Actions" />
              </Dropdown>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

/* ── Managers ── */
const ManagersTab: React.FC<{ c: Detail; onChanged: () => void }> = ({ c, onChanged }) => {
  const { apiCall } = useAuth();
  const { message } = AntApp.useApp();
  const [adding, setAdding] = useState(false);
  const [first, setFirst] = useState(''); const [last, setLast] = useState(''); const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const add = async () => {
    setBusy(true);
    try {
      const r = await call<{ invitation_sent: boolean }>(apiCall, `/admin/organizations/${c.id}/managers`, 'POST', { first_name: first, last_name: last, email });
      message[r.invitation_sent ? 'success' : 'warning'](r.invitation_sent ? `${first} added and invited` : `${first} added, but the invitation email could not be sent`);
      setAdding(false); setFirst(''); setLast(''); setEmail(''); onChanged();
    } catch (e) { message.error(errorText(e, en)); } finally { setBusy(false); }
  };
  const act = async (m: Person, what: 'on' | 'off' | 'invite') => {
    try {
      if (what === 'invite') {
        const r = await call<{ invitation_sent: boolean }>(apiCall, `/admin/organizations/${c.id}/accounts/${m.id}/invite`, 'POST');
        message[r.invitation_sent ? 'success' : 'warning'](r.invitation_sent ? `New invitation sent to ${m.email}` : 'Password reset, but the email could not be sent');
      } else {
        await call(apiCall, `/admin/organizations/${c.id}/accounts/${m.id}/active`, 'PUT', { active: what === 'on' });
        message.success(what === 'on' ? 'Reactivated' : 'Deactivated: only this manager is signed out, the company keeps working');
      }
      onChanged();
    } catch (e) { message.error(errorText(e, en)); }
  };
  return (
    <section className="og-card">
      <div className="og-card-head"><span className="og-card-title"><TeamOutlined />Managers</span>
        <Button size="small" type="primary" icon={<UserAddOutlined />} onClick={() => setAdding(true)}>Add a manager</Button></div>
      <div className="og-list">
        {c.managers.map(m => (
          <div key={m.id} className={`og-row is-manager${m.is_active ? '' : ' is-off'}`}>
            <span className="og-cell-main"><strong>{personName(m)}</strong><em>{m.email}</em></span>
            <span className="og-hide-sm og-muted">{m.invitation_pending ? 'Not signed in yet' : `Seen ${ago(m.last_seen_at, en)}`}</span>
            <span className="og-hide-sm og-muted">since {fmtDate(m.created_at, 'en-GB')}</span>
            <Dropdown trigger={['click']} menu={{ items: m.is_active ? [
              { key: 'i', icon: <MailOutlined />, label: 'Send a new invitation', onClick: () => act(m, 'invite') },
              { key: 'off', icon: <StopOutlined />, danger: true, label: 'Deactivate this manager', onClick: () => act(m, 'off') },
            ] : [{ key: 'on', icon: <CheckCircleOutlined />, label: 'Reactivate', onClick: () => act(m, 'on') }] }}>
              <Button type="text" size="small" icon={<MoreOutlined />} aria-label="Actions" />
            </Dropdown>
          </div>
        ))}
      </div>
      <Modal open={adding} onCancel={() => setAdding(false)} onOk={add} okText="Add and invite" okButtonProps={{ loading: busy, disabled: !first.trim() || !last.trim() || !email.trim() }}
        title="Add a manager" wrapClassName="og-modal" width={460}>
        <div className="og-form">
          <div className="og-two">
            <div className="og-field"><label>First name</label><Input value={first} onChange={e => setFirst(e.target.value)} maxLength={50} /></div>
            <div className="og-field"><label>Last name</label><Input value={last} onChange={e => setLast(e.target.value)} maxLength={50} /></div>
          </div>
          <div className="og-field"><label>Email (their sign-in)</label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} maxLength={100} /></div>
        </div>
      </Modal>
    </section>
  );
};

/* ── Exams ── */
const ContentTab: React.FC<{ c: Detail; onChanged: () => void }> = ({ c, onChanged }) => {
  const { apiCall } = useAuth();
  const { message } = AntApp.useApp();
  const [tree, setTree] = useState<ContentNode[] | null>(null);
  const initial = useMemo(() => c.content.map(x => `${x.content_type}:${x.content_id}`), [c.content]);
  const [value, setValue] = useState<string[]>(initial);
  const [busy, setBusy] = useState(false);
  useEffect(() => { call<ContentNode[]>(apiCall, '/tcf/exam-assignments/content-tree').then(setTree).catch(() => setTree([])); }, [apiCall]);
  useEffect(() => { setValue(initial); }, [initial]);
  const index = useMemo(() => indexTree(tree || []), [tree]);
  const dirty = value.slice().sort().join() !== initial.slice().sort().join();
  const save = async () => {
    setBusy(true);
    try {
      const items = value.map(k => { const [t, i] = k.split(':'); return { content_type: t, content_id: Number(i) }; });
      await call(apiCall, `/admin/organizations/${c.id}/content`, 'PUT', { content: items });
      message.success('Allowed exams saved: the company’s learners lose access at once to anything removed');
      onChanged();
    } catch (e) { message.error(errorText(e, en)); } finally { setBusy(false); }
  };
  return (
    <section className="og-card">
      <div className="og-card-head"><span className="og-card-title">Exams the company may use</span>
        <span className="og-actions">
          <Button size="small" onClick={() => setValue(index.roots)} disabled={!tree}>All exam preparation</Button>
          <Button size="small" type="primary" icon={<SaveOutlined />} onClick={save} loading={busy} disabled={!dirty || !value.length}>Save</Button>
        </span></div>
      <div className="og-card-body">
        <ContentTreePicker tree={tree} value={value} onChange={setValue} loading={!tree} height={460} english />
        {tree && value.some(k => !index.map.has(k)) && <small className="og-muted">Some allowed content no longer exists and will be dropped on save.</small>}
      </div>
    </section>
  );
};

/* ── Credit history ── */
const CreditsTab: React.FC<{ c: Detail }> = ({ c }) => {
  const { apiCall } = useAuth();
  const [items, setItems] = useState<CreditMove[] | null>(null);
  useEffect(() => { call<{ items: CreditMove[] }>(apiCall, `/admin/organizations/${c.id}/credits?limit=300`).then(r => setItems(r.items)).catch(() => setItems([])); }, [apiCall, c.id, c.credits]);
  return (
    <section className="og-card">
      {items === null ? <div style={{ padding: 18 }}><Skeleton active /></div> : items.length === 0 ? <Empty icon={<ThunderboltOutlined />} title="No movement yet" /> : (
        <div className="og-list">
          {items.map(m => (
            <div key={m.id} className={`og-row is-move fam-${m.credit_type}`}>
              <span className="og-muted">{fmtDate(m.created_at, 'en-GB')}</span>
              <span className="og-cell-main"><strong>{moveText(m, en)}</strong><em>{m.actor_first_name ? `${personName({ first_name: m.actor_first_name, last_name: m.actor_last_name })}${m.actor_role === 'admin' ? ' (admin)' : ''}` : 'Automatic'}{m.notes ? ` · ${m.notes}` : ''}</em></span>
              <span className="og-tag og-hide-sm" style={{ background: 'var(--f-bg)', color: 'var(--f)' }}>{m.credit_type.toUpperCase()}</span>
              <span className="og-num" style={{ textAlign: 'right', color: m.delta >= 0 ? '#047857' : '#b91c1c' }}>{m.delta > 0 ? `+${m.delta}` : m.delta}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

/* ── Logo ── */
const BrandTab: React.FC<{ c: Detail; onChanged: () => void }> = ({ c, onChanged }) => {
  const { apiCall } = useAuth();
  const { message } = AntApp.useApp();
  const [busy, setBusy] = useState(false);
  const upload = async (file: File) => {
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) { message.error('PNG, JPG or WebP only'); return false; }
    if (file.size > 1024 * 1024) { message.error('1 MB at most'); return false; }
    setBusy(true);
    try { const f = new FormData(); f.append('logo', file); await call(apiCall, `/admin/organizations/${c.id}/logo`, 'POST', f); message.success('Logo updated'); onChanged(); }
    catch (e) { message.error(errorText(e, en)); } finally { setBusy(false); }
    return false;
  };
  const remove = async () => {
    try { await call(apiCall, `/admin/organizations/${c.id}/logo`, 'DELETE'); message.success('Logo removed'); onChanged(); } catch (e) { message.error(errorText(e, en)); }
  };
  return (
    <section className="og-card">
      <div className="og-card-head"><span className="og-card-title"><PictureOutlined />Logo</span></div>
      <div className="og-card-body og-form">
        <div className="og-brand-preview">
          <LogoTile name={c.brand.name} logoUrl={c.brand.logo_url} size="lg" />
          <div><strong>{c.brand.name}</strong><em>Shown to the company’s managers and learners, on its sign-in page and in its emails.</em>
            <div className="og-actions" style={{ marginTop: 10 }}>
              <Upload accept=".png,.jpg,.jpeg,.webp" showUploadList={false} beforeUpload={upload}><Button icon={<UploadOutlined />} loading={busy}>{c.brand.logo_url ? 'Change' : 'Upload'}</Button></Upload>
              {c.brand.logo_url && <Popconfirm title="Remove the logo?" okText="Remove" okButtonProps={{ danger: true }} onConfirm={remove}><Button danger icon={<DeleteOutlined />}>Remove</Button></Popconfirm>}
            </div></div>
        </div>
        <small className="og-muted">The company can also change its logo and displayed name from its own settings.</small>
      </div>
    </section>
  );
};

/* ── Activity ── */
/* ── Extend access ── */
const ExtendModal: React.FC<{ open: boolean; c: Detail; onClose: () => void; onDone: () => void }> = ({ open, c, onClose, onDone }) => {
  const { apiCall } = useAuth();
  const { message } = AntApp.useApp();
  const base = dayjs(c.access_ends_at);
  const from = base.isBefore(dayjs()) ? dayjs() : base;
  const [until, setUntil] = useState<Dayjs | null>(from.add(3, 'month').endOf('day'));
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (open) { setUntil(from.add(3, 'month').endOf('day')); setNote(''); } }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  const save = async () => {
    setBusy(true);
    try {
      await call(apiCall, `/admin/organizations/${c.id}`, 'PUT', { access_ends_at: until!.toISOString(), note: note.trim() || undefined });
      message.success(`Access until ${until!.format('DD/MM/YYYY')}${c.state !== 'active' ? ': everything is open again' : ''}`);
      onDone();
    } catch (e) { message.error(errorText(e, en)); } finally { setBusy(false); }
  };
  const shorter = until && until.isBefore(dayjs(c.access_ends_at));
  return (
    <Modal open={open} onCancel={onClose} onOk={save} okText="Save the new end date" okButtonProps={{ loading: busy, disabled: !until || !until.isAfter(dayjs(c.access_starts_at)) }}
      title="Access end date" wrapClassName="og-modal" width={460}>
      <div className="og-form">
        <p className="og-muted" style={{ margin: 0 }}>Currently until <b>{fmtDate(c.access_ends_at, 'en-GB')}</b>. A new date takes effect at once for the company and all its learners.</p>
        <DatePicker value={until} onChange={v => setUntil(v ? v.endOf('day') : null)} format="DD/MM/YYYY" style={{ width: '100%' }}
          presets={[
            { label: '+1 month', value: from.add(1, 'month').endOf('day') },
            { label: '+3 months', value: from.add(3, 'month').endOf('day') },
            { label: '+6 months', value: from.add(6, 'month').endOf('day') },
            { label: '+1 year', value: from.add(1, 'year').endOf('day') },
          ]} />
        {until && <p className="og-muted" style={{ margin: 0 }}>{fmtDate(c.access_ends_at, 'en-GB')} → <b>{until.format('DD/MM/YYYY')}</b> · {until.diff(dayjs(c.access_ends_at), 'day') >= 0 ? '+' : ''}{until.diff(dayjs(c.access_ends_at), 'day')} days</p>}
        <Input value={note} onChange={e => setNote(e.target.value)} maxLength={500} placeholder="Reason (optional), e.g. contract renewed, invoice 2026-114" />
        {shorter && <div className="og-check tone-warn"><WarningOutlined /><span>This shortens the access: every learner’s access is capped at the new date.</span></div>}
        <small className="og-muted">Recorded in the company’s history with the previous date, the new one and who changed it.</small>
      </div>
    </Modal>
  );
};

/* ── Credits: add to or take back from the reserve — writing, speaking or both at once ── */
const CreditsModal: React.FC<{ open: boolean; c: Detail; onClose: () => void; onDone: () => void }> = ({ open, c, onClose, onDone }) => {
  const { apiCall } = useAuth();
  const { message } = AntApp.useApp();
  const [action, setAction] = useState<'grant' | 'revoke'>('grant');
  const [kinds, setKinds] = useState<CreditType[]>(['ee', 'eo']);
  const [amounts, setAmounts] = useState<Amounts>({ ee: 10, eo: 10 });
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => { if (open) { setAction('grant'); setKinds(['ee', 'eo']); setAmounts({ ee: 10, eo: 10 }); setNotes(''); setErr(null); } }, [open]);
  const grant = action === 'grant';
  const lines: ReceiptLine[] = kinds.map(t => {
    const n = amounts[t] || 0;
    const reserve = c.credits[t].reserve;
    const after = grant ? reserve + n : reserve - n;
    const ok = n > 0 && after >= 0;
    return {
      kind: t,
      ok,
      what: `${creditName(t, 'en')} reserve`,
      detail: after < 0 ? `It holds ${reserve}: credits already with learners must be taken back from them first` : `${reserve} → ${after}`,
      total: `${grant ? '+' : '−'}${n}`,
    };
  });
  const ready = lines.every(l => l.ok);
  const save = async () => {
    setBusy(true); setErr(null);
    try {
      const r = await call<{ reserve: Record<CreditType, number> }>(apiCall, `/admin/organizations/${c.id}/credits`, 'POST',
        { action, amounts: chosenAmounts(kinds, amounts), notes: notes.trim() || null });
      message.success(`${grant ? 'Added' : 'Taken back'} · reserve now ${r.reserve.ee} EE and ${r.reserve.eo} EO`);
      onDone();
    } catch (e) { setErr(errorText(e, en)); } finally { setBusy(false); }
  };
  return (
    <Modal open={open} onCancel={onClose} footer={null} wrapClassName="og-modal" width={520} destroyOnHidden>
      <div className="og-modal-head"><span className="og-logo"><ThunderboltOutlined /></span><div>
        <h3>Company credits</h3><p>{c.name} · the reserve its managers hand out from</p></div></div>
      <div className="og-form">
        <Segmented block value={action} onChange={v => { setAction(v as 'grant' | 'revoke'); setErr(null); }}
          options={[{ value: 'grant', label: <><PlusOutlined /> Add</> }, { value: 'revoke', label: <><MinusOutlined /> Take back</> }]} />
        <div className="og-field"><label>Which credits <em>one or both</em></label>
          <KindPicker value={kinds} onChange={setKinds} lang="en" note={t => `${c.credits[t].reserve} in reserve · ${c.credits[t].with_learners} with learners`} /></div>
        <AmountBoxes kinds={kinds} values={amounts} onChange={setAmounts} label={t => `${creditName(t, 'en')} credits`} />
        <CreditReceipt lines={lines} />
        <Input value={notes} onChange={e => setNotes(e.target.value)} maxLength={500} placeholder="Note (optional), e.g. invoice number" />
        {err && <div className="og-check tone-bad"><WarningOutlined /><span>{err}</span></div>}
        <div className="og-foot">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" danger={!grant} onClick={save} loading={busy} disabled={!ready}>{grant ? 'Add credits' : 'Take credits back'}</Button>
        </div>
      </div>
    </Modal>
  );
};

/* ── Edit details ── */
const EditDrawer: React.FC<{ open: boolean; c: Detail; onClose: () => void; onDone: () => void }> = ({ open, c, onClose, onDone }) => {
  const { apiCall } = useAuth();
  const { message } = AntApp.useApp();
  const [name, setName] = useState(c.name);
  const [displayName, setDisplayName] = useState(c.display_name || '');
  const [language, setLanguage] = useState(c.default_language);
  const [starts, setStarts] = useState<Dayjs | null>(dayjs(c.access_starts_at));
  const [ends, setEnds] = useState<Dayjs | null>(dayjs(c.access_ends_at));
  const [seats, setSeats] = useState<number | null>(c.seat_limit);
  const tooLow = !!seats && seats < c.seats_used;
  const [notes, setNotes] = useState(c.notes || '');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!open) return;
    setName(c.name); setDisplayName(c.display_name || ''); setLanguage(c.default_language);
    setStarts(dayjs(c.access_starts_at)); setEnds(dayjs(c.access_ends_at)); setSeats(c.seat_limit); setNotes(c.notes || '');
  }, [open, c]);
  const save = async () => {
    setBusy(true);
    try {
      await call(apiCall, `/admin/organizations/${c.id}`, 'PUT', {
        name, display_name: displayName.trim() || null, default_language: language,
        access_starts_at: starts?.toISOString(), access_ends_at: ends?.toISOString(), seat_limit: seats, notes,
      });
      message.success('Saved');
      onDone();
    } catch (e) { message.error(errorText(e, en)); } finally { setBusy(false); }
  };
  return (
    <Drawer open={open} onClose={onClose} width="min(520px, 100vw)" rootClassName="og-drawer" title="Edit company"
      footer={<div className="og-foot"><Button onClick={onClose}>Cancel</Button><Button type="primary" onClick={save} loading={busy} disabled={!name.trim() || !ends || !seats}>Save</Button></div>}>
      <div className="og-form">
        <div className="og-field"><label>Official name</label><Input value={name} onChange={e => setName(e.target.value)} maxLength={160} /></div>
        <div className="og-field"><label>Name shown to learners</label><Input value={displayName} onChange={e => setDisplayName(e.target.value)} maxLength={160} placeholder={name} /></div>
        <div className="og-field"><label>Language</label><Segmented value={language} onChange={v => setLanguage(v as 'fr' | 'en')} options={[{ value: 'fr', label: 'Français' }, { value: 'en', label: 'English' }]} /></div>
        <div className="og-two">
          <div className="og-field"><label>From</label><DatePicker value={starts} onChange={setStarts} format="DD/MM/YYYY" style={{ width: '100%' }} /></div>
          <div className="og-field"><label>Until</label><DatePicker value={ends} onChange={v => setEnds(v ? v.endOf('day') : null)} format="DD/MM/YYYY" style={{ width: '100%' }} /></div>
        </div>
        <div className="og-field"><label>Package — learner accounts</label><InputNumber min={1} max={100000} value={seats} onChange={v => setSeats(v)} style={{ width: 200 }} addonAfter="accounts" status={!seats ? 'error' : undefined} />
          <small>The company has created {c.seats_used} learner account(s). Every account counts, active or deactivated.</small>
          {tooLow && <small className="is-error">Below the {c.seats_used} accounts already created: they are all kept, but the company cannot add anyone until you raise it again.</small>}</div>
        <div className="og-field"><label>Private notes</label><Input.TextArea value={notes} onChange={e => setNotes(e.target.value)} maxLength={2000} autoSize={{ minRows: 3, maxRows: 8 }} /></div>
      </div>
    </Drawer>
  );
};

export default CompanyDetail;
