import React, { useEffect, useMemo, useRef, useState } from 'react';
import { App as AntApp, Button, DatePicker, Drawer, Input, InputNumber, Segmented, Skeleton, Upload } from 'antd';
import { BankOutlined, CheckCircleOutlined, UploadOutlined, WarningOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { useAuth } from '../../../contexts/AuthContext';
import { apiAsset } from '../../../utils/apiAsset';
import {
  DEFAULT_PORTAL_BRANDING,
  THEME_PRESETS,
  normalizePortalBranding,
  validateHex,
} from '../../../utils/portalTheme';
import type { HeroStyle, LoginLayout, PortalBranding, SurfaceTone } from '../../../utils/portalTheme';
import CompanyLoginShell from '../../Auth/CompanyLoginShell';
import { call, errorText } from '../../Org/orgModel';
import type { Company, ContentRef } from '../../Org/orgModel';
import { LogoTile } from '../../Org/OrgUi';
import ContentTreePicker from '../../Org/ContentTreePicker';
import { indexTree } from '../../Org/contentTreeIndex';
import type { ContentNode } from '../../Org/contentTreeIndex';
import '../../Org/Org.css';

const en = (e: string) => e;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?$/;
const LOGO_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

/* Administrator: create a company OR edit every detail (identity, logo, portal branding & preview, access, allowed exams, notes) pre-filled. */
const CompanyCreate: React.FC<{
  open: boolean;
  editCompanyId?: number | null;
  onClose: () => void;
  onCreated?: (id: number) => void;
  onSaved?: () => void;
}> = ({ open, editCompanyId = null, onClose, onCreated, onSaved }) => {
  const isEdit = editCompanyId != null;
  const { apiCall } = useAuth();
  const { message } = AntApp.useApp();
  const [tree, setTree] = useState<ContentNode[] | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [existingCompany, setExistingCompany] = useState<(Company & { content: ContentRef[] }) | null>(null);
  const [existingLogoUrl, setExistingLogoUrl] = useState<string | null>(null);
  const [existingCoverUrl, setExistingCoverUrl] = useState<string | null>(null);
  const [logoRemoved, setLogoRemoved] = useState(false);
  const [initialContentKeys, setInitialContentKeys] = useState<string[]>([]);

  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');
  const [starts, setStarts] = useState<Dayjs | null>(dayjs());
  const [ends, setEnds] = useState<Dayjs | null>(dayjs().add(3, 'month').endOf('day'));
  const [seats, setSeats] = useState<number | null>(5);
  const [content, setContent] = useState<string[]>([]);
  const [ee, setEe] = useState<number | null>(0);
  const [eo, setEo] = useState<number | null>(0);
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [branding, setBranding] = useState<PortalBranding>(DEFAULT_PORTAL_BRANDING);
  const [customSlug, setCustomSlug] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Dynamic scale for the live 1140x680 CompanyLoginShell preview
  const previewWrapRef = useRef<HTMLDivElement | null>(null);
  const [previewWidth, setPreviewWidth] = useState(640);
  useEffect(() => {
    const el = previewWrapRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const obs = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect?.width;
      if (w && w > 0) setPreviewWidth(w);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [open, loadingDetail]);
  const previewScale = Math.min(1, Math.max(0.24, previewWidth / 1140));
  const previewHeight = Math.round(680 * previewScale);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    setErr(null);
    setLogo(null);
    setLogoRemoved(false);
    call<ContentNode[]>(apiCall, '/tcf/exam-assignments/content-tree')
      .then(t => { if (alive) setTree(t); })
      .catch(() => { if (alive) setTree([]); });

    if (editCompanyId != null) {
      setLoadingDetail(true);
      call<Company & { content: ContentRef[] }>(apiCall, `/admin/organizations/${editCompanyId}`)
        .then(co => {
          if (!alive) return;
          const keys = (co.content || []).map(x => `${x.content_type}:${x.content_id}`);
          setExistingCompany(co);
          setExistingLogoUrl(co.brand?.logo_url ? apiAsset(co.brand.logo_url) : null);
          setExistingCoverUrl(co.brand?.cover_url ? apiAsset(co.brand.cover_url) : null);
          setInitialContentKeys(keys);
          setName(co.name);
          setDisplayName(co.display_name || '');
          setLanguage(co.default_language);
          setStarts(dayjs(co.access_starts_at));
          setEnds(dayjs(co.access_ends_at));
          setSeats(co.seat_limit);
          setContent(keys);
          setNotes(co.notes || '');
          setCustomSlug(co.slug);
          setBranding(normalizePortalBranding(co.brand?.branding));
          setFirst(''); setLast(''); setEmail(''); setEe(0); setEo(0);
          setLoadingDetail(false);
        })
        .catch(e => {
          if (!alive) return;
          setErr(errorText(e, en));
          setLoadingDetail(false);
        });
    } else {
      setLoadingDetail(false);
      setExistingCompany(null);
      setExistingLogoUrl(null);
      setExistingCoverUrl(null);
      setInitialContentKeys([]);
      setName(''); setDisplayName(''); setLanguage('fr'); setStarts(dayjs()); setEnds(dayjs().add(3, 'month').endOf('day'));
      setSeats(5); setContent([]); setEe(0); setEo(0); setFirst(''); setLast(''); setEmail(''); setNotes('');
      setBranding(DEFAULT_PORTAL_BRANDING); setCustomSlug('');
    }
    return () => { alive = false; };
  }, [open, editCompanyId, apiCall]);

  useEffect(() => {
    if (!open || !logo) { setLogoPreview(null); return; }
    const url = URL.createObjectURL(logo);
    setLogoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [open, logo]);

  const selectLogo = (file: File) => {
    if (!LOGO_TYPES.includes(file.type)) message.error('Choose a PNG, JPG or WebP image.');
    else if (file.size > 1024 * 1024) message.error('The logo must be 1 MB or less.');
    else { setLogo(file); setLogoRemoved(false); }
    return false;
  };

  const shownLogoUrl = logoPreview || (!logoRemoved ? existingLogoUrl : null);

  const index = useMemo(() => indexTree(tree || []), [tree]);
  const everything = () => setContent(index.roots);
  const allChosen = index.roots.length > 0 && index.roots.every(k => content.includes(k));
  const cleanSlug = customSlug.trim().toLowerCase();
  const slugValid = !cleanSlug || SLUG_RE.test(cleanSlug);
  const colorsValid = validateHex(branding.primary_color) && validateHex(branding.secondary_color);

  const missing = isEdit
    ? [
        !name.trim() && 'the company name',
        (!cleanSlug || !SLUG_RE.test(cleanSlug)) && 'a valid portal URL slug',
        !colorsValid && 'valid hex portal colors',
        !(ends && (!starts || ends.isAfter(starts))) && 'an end date after the start date',
        !(seats && seats >= 1) && 'the package (number of learner accounts)',
        !content.length && 'at least one exam',
      ].filter(Boolean) as string[]
    : [
        !name.trim() && 'the company name',
        !slugValid && 'a valid portal URL slug',
        !colorsValid && 'valid hex portal colors',
        !(ends && ends.isAfter(dayjs()) && (!starts || ends.isAfter(starts))) && 'an end date in the future, after the start',
        !(seats && seats >= 1) && 'the package (number of learner accounts)',
        !content.length && 'at least one exam',
        !(first.trim() && last.trim() && EMAIL.test(email.trim())) && 'the first manager (name and email)',
      ].filter(Boolean) as string[];

  const contentItemsPayload = () => content.map(k => {
    const r = index.map.get(k);
    if (r) return { content_type: r.node.type, content_id: r.node.content_id ?? r.node.id };
    const [t, idNum] = k.split(':');
    return { content_type: t, content_id: Number(idNum) };
  }).filter(x => x.content_type && Number.isInteger(x.content_id) && x.content_id > 0);

  const submit = async () => {
    setBusy(true); setErr(null);
    try {
      if (isEdit && editCompanyId != null) {
        await call(apiCall, `/admin/organizations/${editCompanyId}`, 'PUT', {
          name: name.trim(),
          display_name: displayName.trim() || null,
          default_language: language,
          slug: cleanSlug,
          portal_branding: branding,
          access_starts_at: starts?.toISOString(),
          access_ends_at: ends!.toISOString(),
          seat_limit: seats,
          notes: notes.trim() || null,
        });

        const contentChanged = content.slice().sort().join() !== initialContentKeys.slice().sort().join();
        if (contentChanged) {
          await call(apiCall, `/admin/organizations/${editCompanyId}/content`, 'PUT', {
            content: contentItemsPayload(),
          });
        }

        if (logo) {
          const fd = new FormData();
          fd.append('logo', logo);
          await call(apiCall, `/admin/organizations/${editCompanyId}/logo`, 'POST', fd);
        } else if (logoRemoved && existingCompany?.brand?.logo_url) {
          await call(apiCall, `/admin/organizations/${editCompanyId}/logo`, 'DELETE');
        }

        message.success(`${displayName.trim() || name.trim()} updated`);
        onSaved?.();
        return;
      }

      const items = contentItemsPayload();
      const payload = {
        name: name.trim(), display_name: displayName.trim() || null, default_language: language,
        ...(cleanSlug ? { slug: cleanSlug } : {}),
        portal_branding: branding,
        access_starts_at: starts?.toISOString(), access_ends_at: ends!.toISOString(), seat_limit: seats,
        content: items, ee_credits: ee || 0, eo_credits: eo || 0, notes: notes.trim() || null,
        manager: { first_name: first.trim(), last_name: last.trim(), email: email.trim() },
      };
      let body: typeof payload | FormData = payload;
      if (logo) {
        const form = new FormData();
        form.append('payload', JSON.stringify(payload));
        form.append('logo', logo);
        body = form;
      }
      const r = await call<{ organization: { id: number }; manager: { invitation_sent: boolean } }>(apiCall, '/admin/organizations', 'POST', body);
      if (r.manager.invitation_sent) message.success(`${name} created · ${first} was invited by email`);
      else message.warning(`${name} created, but the invitation email could not be sent: send it again from the company’s page.`);
      onCreated?.(r.organization.id);
    } catch (e) { setErr(errorText(e, en)); } finally { setBusy(false); }
  };

  const tooLow = isEdit && !!existingCompany && !!seats && seats < existingCompany.seats_used;

  return (
    <Drawer open={open} onClose={busy ? undefined : onClose} closable={!busy} keyboard={!busy} width="min(760px, 100vw)" rootClassName="og-drawer" destroyOnHidden
      title={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}><BankOutlined />{isEdit ? `Edit company${existingCompany ? ` · ${existingCompany.brand.name}` : ''}` : 'New company'}</span>}
      footer={<div className="og-foot">
        <span className="og-foot-note">
          {missing.length
            ? `Still needed: ${missing.join(', ')}.`
            : isEdit
              ? 'All company details, branding and allowed exams are ready to save.'
              : 'Ready: the manager receives an email with a temporary password.'}
        </span>
        <Button onClick={onClose} disabled={busy}>Cancel</Button>
        <Button type="primary" onClick={submit} loading={busy} disabled={loadingDetail || missing.length > 0}>
          {isEdit ? 'Save changes' : 'Create the company'}
        </Button>
      </div>}>
      {loadingDetail ? (
        <Skeleton active paragraph={{ rows: 12 }} />
      ) : (
        <div className="og-form">
          <section className="og-section">
            <div className="og-section-title"><span className="og-step">1</span>Company & portal branding</div>
            <div className="og-two">
              <div className="og-field"><label>Official name</label><Input value={name} onChange={e => setName(e.target.value)} maxLength={160} placeholder="e.g. Acme Formation SAS" autoFocus={!isEdit} /></div>
              <div className="og-field"><label>Name shown to learners <em>optional</em></label><Input value={displayName} onChange={e => setDisplayName(e.target.value)} maxLength={160} placeholder={name || 'e.g. Acme'} /></div>
            </div>
            <div className="og-brand-preview">
              {shownLogoUrl
                ? <span className="og-logo"><img src={shownLogoUrl} alt="Company logo preview" /></span>
                : <LogoTile name={displayName.trim() || name.trim() || 'Company'} />}
              <div>
                <strong>Company logo</strong>
                <em>Optional. Shown on the sign-in page, dashboard and in invitations.</em>
                <div className="og-actions" style={{ marginTop: 8 }}>
                  <Upload accept=".png,.jpg,.jpeg,.webp" showUploadList={false} beforeUpload={selectLogo} disabled={busy}>
                    <Button icon={<UploadOutlined />} disabled={busy}>{shownLogoUrl ? 'Change logo' : 'Add logo'}</Button>
                  </Upload>
                  {shownLogoUrl && (
                    <Button disabled={busy} onClick={() => { setLogo(null); setLogoRemoved(true); }}>
                      Remove logo
                    </Button>
                  )}
                </div>
                <small className="og-muted">PNG, JPG or WebP, up to 1 MB.</small>
              </div>
            </div>
            <div className="og-field"><label>Language of the company’s space and emails</label>
              <Segmented value={language} onChange={v => setLanguage(v as 'fr' | 'en')} options={[{ value: 'fr', label: 'Français' }, { value: 'en', label: 'English' }]} /></div>

            <div style={{ marginTop: 14, padding: 14, borderRadius: 12, border: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <strong style={{ fontSize: 13, color: '#0F172A' }}>Portal appearance & live sign-in preview</strong>
                <span style={{ fontSize: 11.5, color: '#64748B' }}>
                  {isEdit ? 'Extra copy, cover image and badges are in Portal & Branding' : 'More options (cover photo, copy, links) available after creation'}
                </span>
              </div>
              <div className="og-two">
                <div className="og-field">
                  <label>Portal URL {isEdit ? '' : <em>optional</em>}</label>
                  <Input addonBefore="/o/" value={customSlug} onChange={e => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} maxLength={80} placeholder="auto-from-name" status={(isEdit && !cleanSlug) || !slugValid ? 'error' : undefined} />
                </div>
                <div className="og-field">
                  <label>Portal tagline <em>optional</em></label>
                  <Input value={branding.tagline} onChange={e => setBranding(b => ({ ...b, tagline: e.target.value }))} maxLength={80} placeholder="e.g. Corporate French Academy" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {THEME_PRESETS.map(p => {
                  const active = branding.primary_color === p.primary_color && branding.secondary_color === p.secondary_color;
                  return (
                    <button key={p.id} type="button" onClick={() => setBranding(b => ({ ...b, primary_color: p.primary_color, secondary_color: p.secondary_color, surface_tone: p.surface_tone, hero_style: existingCoverUrl ? b.hero_style : p.hero_style }))}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 999, border: active ? '1.5px solid #0F172A' : '1px solid #CBD5E1', background: '#FFFFFF', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      <span style={{ width: 12, height: 12, borderRadius: '50%', background: p.primary_color }} />
                      {p.name}
                    </button>
                  );
                })}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#334155' }}>
                  Primary
                  <input type="color" value={validateHex(branding.primary_color) ? branding.primary_color : '#16325C'} onChange={e => setBranding(b => ({ ...b, primary_color: e.target.value.toUpperCase() }))} style={{ width: 32, height: 28, padding: 1, border: '1px solid #CBD5E1', borderRadius: 6, cursor: 'pointer' }} aria-label="Custom primary color" />
                  <Input size="small" value={branding.primary_color} onChange={e => setBranding(b => ({ ...b, primary_color: e.target.value.toUpperCase() }))} maxLength={7} style={{ width: 84, fontFamily: 'monospace' }} status={!validateHex(branding.primary_color) ? 'error' : undefined} />
                </label>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#334155' }}>
                  Secondary
                  <input type="color" value={validateHex(branding.secondary_color) ? branding.secondary_color : '#0F766E'} onChange={e => setBranding(b => ({ ...b, secondary_color: e.target.value.toUpperCase() }))} style={{ width: 32, height: 28, padding: 1, border: '1px solid #CBD5E1', borderRadius: 6, cursor: 'pointer' }} aria-label="Custom secondary color" />
                  <Input size="small" value={branding.secondary_color} onChange={e => setBranding(b => ({ ...b, secondary_color: e.target.value.toUpperCase() }))} maxLength={7} style={{ width: 84, fontFamily: 'monospace' }} status={!validateHex(branding.secondary_color) ? 'error' : undefined} />
                </label>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <Segmented size="small" value={branding.login_layout} onChange={v => setBranding(b => ({ ...b, login_layout: v as LoginLayout }))}
                  options={[{ value: 'split', label: 'Split' }, { value: 'centered', label: 'Centered' }, { value: 'minimal', label: 'Minimal' }]} />
                <Segmented size="small" value={branding.surface_tone} onChange={v => setBranding(b => ({ ...b, surface_tone: v as SurfaceTone }))}
                  options={[{ value: 'clean', label: 'Clean' }, { value: 'warm', label: 'Warm' }, { value: 'slate', label: 'Slate' }]} />
                <Segmented size="small" value={branding.hero_style} onChange={v => setBranding(b => ({ ...b, hero_style: v as HeroStyle }))}
                  options={[
                    { value: 'geometric', label: 'Geometric' },
                    { value: 'gradient', label: 'Gradient' },
                    { value: 'solid', label: 'Solid' },
                    ...(existingCoverUrl ? [{ value: 'cover', label: 'Cover' }] : []),
                  ]} />
              </div>
              <div ref={previewWrapRef} style={{ width: '100%', height: previewHeight, overflow: 'hidden', borderRadius: 10, border: '1px solid #CBD5E1', background: '#FFFFFF', position: 'relative' }}>
                <div style={{ width: 1140, height: 680, transform: `scale(${previewScale})`, transformOrigin: 'top left', pointerEvents: 'none' }}>
                  <CompanyLoginShell
                    company={{ name: displayName.trim() || name.trim() || 'Your Company', slug: cleanSlug || 'company', logo_url: null, cover_url: null, default_language: language, branding }}
                    logoUrlOverride={shownLogoUrl}
                    coverUrlOverride={existingCoverUrl}
                    audience="company_learner"
                    step="email"
                    lang={language}
                    previewMode
                    forceViewport="desktop"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="og-section">
            <div className="og-section-title"><span className="og-step">2</span>Access</div>
            <div className="og-two">
              <div className="og-field"><label>From</label><DatePicker value={starts} onChange={setStarts} format="DD/MM/YYYY" style={{ width: '100%' }} /></div>
              <div className="og-field"><label>Until</label>
                <DatePicker value={ends} onChange={v => setEnds(v ? v.endOf('day') : null)} format="DD/MM/YYYY" style={{ width: '100%' }}
                  disabledDate={isEdit ? undefined : (d => d.isBefore(dayjs(), 'day'))}
                  presets={[
                    { label: '3 months', value: dayjs().add(3, 'month').endOf('day') },
                    { label: '6 months', value: dayjs().add(6, 'month').endOf('day') },
                    { label: '1 year', value: dayjs().add(1, 'year').endOf('day') },
                  ]} /></div>
            </div>
            <div className="og-field"><label>Package — learner accounts</label>
              <InputNumber min={1} max={100000} value={seats} onChange={v => setSeats(v)} style={{ width: 200 }} addonAfter="accounts"
                status={!seats ? 'error' : undefined} />
              <small>How many learner accounts the company may create. Every account counts, active or deactivated: deactivating a learner does not free a place. You can raise it at any time.</small>
              {tooLow && existingCompany && <small className="is-error">Below the {existingCompany.seats_used} accounts already created: they are all kept, but the company cannot add anyone until you raise it again.</small>}
            </div>
            <small className="og-muted">After the end date the company and its learners can still sign in and see results; exams, assignments and credits are closed until you extend the date.</small>
          </section>

          <section className="og-section">
            <div className="og-section-title"><span className="og-step">3</span>Exams the company may use
              <span style={{ flex: 1 }} />
              <Button size="small" type={allChosen ? 'primary' : 'default'} onClick={everything} disabled={!index.roots.length}>All exam preparation</Button></div>
            <ContentTreePicker tree={tree} value={content} onChange={setContent} loading={!tree} height={300} english />
            <small className="og-muted">The company assigns only within this. Ticking a skill includes all its series, years and months, including those added later.</small>
          </section>

          {!isEdit ? (
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
          ) : (
            <section className="og-section">
              <div className="og-section-title"><span className="og-step">4</span>Private notes</div>
              <div className="og-field"><label>Private notes <em>optional, only administrators see them</em></label>
                <Input.TextArea value={notes} onChange={e => setNotes(e.target.value)} maxLength={2000} autoSize={{ minRows: 3, maxRows: 6 }} /></div>
              <small className="og-muted">To add or revoke AI credits or invite additional managers, use the company’s Credits or Managers tab.</small>
            </section>
          )}

          {!missing.length && <div className="og-check tone-ok"><CheckCircleOutlined /><span>{content.length} exam item(s){!isEdit ? ` · ${ee || 0} EE and ${eo || 0} EO credits` : ''} · until {ends?.format('DD/MM/YYYY')} · package of {seats} learner account(s).</span></div>}
          {err && <div className="og-check tone-bad"><WarningOutlined /><span>{err}</span></div>}
        </div>
      )}
    </Drawer>
  );
};

export default CompanyCreate;
