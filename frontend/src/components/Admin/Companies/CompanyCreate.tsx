import React, { useEffect, useMemo, useState } from 'react';
import { App as AntApp, Button, DatePicker, Drawer, Input, InputNumber, Segmented } from 'antd';
import { BankOutlined, CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { useAuth } from '../../../contexts/AuthContext';
import { call, errorText } from '../../Org/orgModel';
import ContentTreePicker from '../../Org/ContentTreePicker';
import { indexTree } from '../../Org/contentTreeIndex';
import type { ContentNode } from '../../Org/contentTreeIndex';
import '../../Org/Org.css';

const en = (e: string) => e;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* Administrator: a new company — who it is, its access, its exams, its credits, its first manager. */
const CompanyCreate: React.FC<{ open: boolean; onClose: () => void; onCreated: (id: number) => void }> = ({ open, onClose, onCreated }) => {
  const { apiCall } = useAuth();
  const { message } = AntApp.useApp();
  const [tree, setTree] = useState<ContentNode[] | null>(null);
  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');
  const [starts, setStarts] = useState<Dayjs | null>(dayjs());
  const [ends, setEnds] = useState<Dayjs | null>(dayjs().add(3, 'month').endOf('day'));
  const [seats, setSeats] = useState<number | null>(null);
  const [content, setContent] = useState<string[]>([]);
  const [ee, setEe] = useState<number | null>(0);
  const [eo, setEo] = useState<number | null>(0);
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(''); setDisplayName(''); setLanguage('fr'); setStarts(dayjs()); setEnds(dayjs().add(3, 'month').endOf('day'));
    setSeats(5); setContent([]); setEe(0); setEo(0); setFirst(''); setLast(''); setEmail(''); setNotes(''); setErr(null);
    call<ContentNode[]>(apiCall, '/tcf/exam-assignments/content-tree').then(setTree).catch(() => setTree([]));
  }, [open, apiCall]);

  const index = useMemo(() => indexTree(tree || []), [tree]);
  const everything = () => setContent(index.roots);
  const allChosen = index.roots.length > 0 && index.roots.every(k => content.includes(k));
  const missing = [
    !name.trim() && 'the company name',
    !(ends && ends.isAfter(dayjs()) && (!starts || ends.isAfter(starts))) && 'an end date in the future, after the start',
    !(seats && seats >= 1) && 'the package (number of learner accounts)',
    !content.length && 'at least one exam',
    !(first.trim() && last.trim() && EMAIL.test(email.trim())) && 'the first manager (name and email)',
  ].filter(Boolean) as string[];

  const submit = async () => {
    setBusy(true); setErr(null);
    try {
      const items = content.map(k => index.map.get(k)).filter(Boolean).map(r => ({ content_type: r!.node.type, content_id: r!.node.content_id ?? r!.node.id }));
      const r = await call<{ organization: { id: number }; manager: { invitation_sent: boolean } }>(apiCall, '/admin/organizations', 'POST', {
        name: name.trim(), display_name: displayName.trim() || null, default_language: language,
        access_starts_at: starts?.toISOString(), access_ends_at: ends!.toISOString(), seat_limit: seats,
        content: items, ee_credits: ee || 0, eo_credits: eo || 0, notes: notes.trim() || null,
        manager: { first_name: first.trim(), last_name: last.trim(), email: email.trim() },
      });
      if (r.manager.invitation_sent) message.success(`${name} created · ${first} was invited by email`);
      else message.warning(`${name} created, but the invitation email could not be sent: send it again from the company’s page.`);
      onCreated(r.organization.id);
    } catch (e) { setErr(errorText(e, en)); } finally { setBusy(false); }
  };

  return (
    <Drawer open={open} onClose={onClose} width="min(760px, 100vw)" rootClassName="og-drawer" destroyOnHidden
      title={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}><BankOutlined />New company</span>}
      footer={<div className="og-foot">
        <span className="og-foot-note">{missing.length ? `Still needed: ${missing.join(', ')}.` : 'Ready: the manager receives an email with a temporary password.'}</span>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="primary" onClick={submit} loading={busy} disabled={missing.length > 0}>Create the company</Button>
      </div>}>
      <div className="og-form">
        <section className="og-section">
          <div className="og-section-title"><span className="og-step">1</span>Company</div>
          <div className="og-two">
            <div className="og-field"><label>Official name</label><Input value={name} onChange={e => setName(e.target.value)} maxLength={160} placeholder="e.g. Acme Formation SAS" autoFocus /></div>
            <div className="og-field"><label>Name shown to learners <em>optional</em></label><Input value={displayName} onChange={e => setDisplayName(e.target.value)} maxLength={160} placeholder={name || 'e.g. Acme'} /></div>
          </div>
          <div className="og-field"><label>Language of the company’s space and emails</label>
            <Segmented value={language} onChange={v => setLanguage(v as 'fr' | 'en')} options={[{ value: 'fr', label: 'Français' }, { value: 'en', label: 'English' }]} /></div>
        </section>

        <section className="og-section">
          <div className="og-section-title"><span className="og-step">2</span>Access</div>
          <div className="og-two">
            <div className="og-field"><label>From</label><DatePicker value={starts} onChange={setStarts} format="DD/MM/YYYY" style={{ width: '100%' }} /></div>
            <div className="og-field"><label>Until</label>
              <DatePicker value={ends} onChange={v => setEnds(v ? v.endOf('day') : null)} format="DD/MM/YYYY" style={{ width: '100%' }}
                disabledDate={d => d.isBefore(dayjs(), 'day')}
                presets={[
                  { label: '3 months', value: dayjs().add(3, 'month').endOf('day') },
                  { label: '6 months', value: dayjs().add(6, 'month').endOf('day') },
                  { label: '1 year', value: dayjs().add(1, 'year').endOf('day') },
                ]} /></div>
          </div>
          <div className="og-field"><label>Package — learner accounts</label>
            <InputNumber min={1} max={100000} value={seats} onChange={v => setSeats(v)} style={{ width: 200 }} addonAfter="accounts"
              status={!seats ? 'error' : undefined} />
            <small>How many learner accounts the company may create. Every account counts, active or deactivated: deactivating a learner does not free a place. You can raise it at any time.</small></div>
          <small className="og-muted">After the end date the company and its learners can still sign in and see results; exams, assignments and credits are closed until you extend the date.</small>
        </section>

        <section className="og-section">
          <div className="og-section-title"><span className="og-step">3</span>Exams the company may use
            <span style={{ flex: 1 }} />
            <Button size="small" type={allChosen ? 'primary' : 'default'} onClick={everything} disabled={!index.roots.length}>All exam preparation</Button></div>
          <ContentTreePicker tree={tree} value={content} onChange={setContent} loading={!tree} height={300} english />
          <small className="og-muted">The company assigns only within this. Ticking a skill includes all its series, years and months, including those added later.</small>
        </section>

        <section className="og-section">
          <div className="og-section-title"><span className="og-step">4</span>AI credits and first manager</div>
          <div className="og-two">
            <div className="og-field"><label>Writing credits (EE)</label><InputNumber min={0} max={100000} value={ee} onChange={v => setEe(v)} style={{ width: '100%' }} /></div>
            <div className="og-field"><label>Speaking credits (EO)</label><InputNumber min={0} max={100000} value={eo} onChange={v => setEo(v)} style={{ width: '100%' }} /></div>
          </div>
          <small className="og-muted">The company’s reserve. Its managers hand them out to learners and can never give more than this. You can add or take back credits at any time.</small>
          <div className="og-two">
            <div className="og-field"><label>Manager first name</label><Input value={first} onChange={e => setFirst(e.target.value)} maxLength={50} /></div>
            <div className="og-field"><label>Manager last name</label><Input value={last} onChange={e => setLast(e.target.value)} maxLength={50} /></div>
          </div>
          <div className="og-field"><label>Manager email (their sign-in)</label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} maxLength={100} status={email && !EMAIL.test(email.trim()) ? 'error' : undefined} /></div>
          <div className="og-field"><label>Private notes <em>optional, only you see them</em></label>
            <Input.TextArea value={notes} onChange={e => setNotes(e.target.value)} maxLength={2000} autoSize={{ minRows: 2, maxRows: 5 }} /></div>
        </section>

        {!missing.length && <div className="og-check tone-ok"><CheckCircleOutlined /><span>{content.length} exam item(s) · {ee || 0} EE and {eo || 0} EO credits · until {ends?.format('DD/MM/YYYY')} · package of {seats} learner account(s).</span></div>}
        {err && <div className="og-check tone-bad"><WarningOutlined /><span>{err}</span></div>}
      </div>
    </Drawer>
  );
};

export default CompanyCreate;
