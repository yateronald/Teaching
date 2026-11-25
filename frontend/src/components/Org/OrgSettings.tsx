import React, { useCallback, useEffect, useState } from 'react';
import { App as AntApp, Button, Input, Segmented, Skeleton, Tabs, Tooltip } from 'antd';
import { BankOutlined, BgColorsOutlined, CopyOutlined, SaveOutlined, SettingOutlined, WarningOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useTr } from '../../utils/useTr';
import { FAMILY_CODE } from '../Admin/examAdminData';
import { call, errorText, familyOfRef, fmtDate } from './orgModel';
import type { Company, ContentRef } from './orgModel';
import { ChangeButton, Empty, LogoTile, PageHeader, StatePill } from './OrgUi';
import PortalBrandingEditor from './PortalBrandingEditor';
import { useCompanyOpen } from './useCompanyOpen';
import './Org.css';

/* The company's own settings: portal customization studio with live preview,
   general display/language settings, and read-only access terms. */
const OrgSettings: React.FC = () => {
  const { apiCall, refreshUser } = useAuth();
  const { tr, locale } = useTr();
  const { message } = AntApp.useApp();
  const { open } = useCompanyOpen();
  const [company, setCompany] = useState<Company | null>(null);
  const [content, setContent] = useState<ContentRef[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const r = await call<{ company: Company; content: ContentRef[] }>(apiCall, '/org/me');
      setCompany(r.company); setContent(r.content);
      setName(r.company.display_name || r.company.name); setLanguage(r.company.default_language);
    } catch (e) { setError(errorText(e, tr)); }
  }, [apiCall, tr]);
  useEffect(() => { load(); }, [load]);

  const handleSaved = useCallback(async () => {
    await refreshUser();
    await load();
  }, [refreshUser, load]);

  const saveGeneral = async () => {
    setSaving(true);
    try {
      await call(apiCall, '/org/settings', 'PUT', { display_name: name.trim(), default_language: language });
      message.success(tr('Saved', 'Enregistré'));
      await handleSaved();
    } catch (e) { message.error(errorText(e, tr)); } finally { setSaving(false); }
  };

  if (error) return <div className="og is-company"><Empty icon={<WarningOutlined />} title={tr('Settings could not be loaded', 'Les paramètres n’ont pas pu être chargés')} text={error} action={<Button onClick={load}>{tr('Try again', 'Réessayez')}</Button>} /></div>;
  if (!company) return <div className="og is-company"><Skeleton active paragraph={{ rows: 10 }} /></div>;

  const signIn = `${window.location.origin}/o/${company.slug}`;
  const dirty = name.trim() !== (company.display_name || company.name) || language !== company.default_language;

  return (
    <div className="og is-company">
      <PageHeader
        overline={tr('Company space', 'Espace entreprise')}
        title={tr('Company & Portal Settings', 'Paramètres et portail entreprise')}
        subtitle={tr('Customize your sign-in portal with your colors, cover image and branding, or check your company access.', 'Personnalisez votre portail de connexion avec vos couleurs, votre image et votre identité de marque.')}
      />

      <Tabs
        className="og-tabs"
        items={[
          {
            key: 'branding',
            label: <><BgColorsOutlined /> {tr('Portal & Branding', 'Portail & Identité')}</>,
            children: (
              <PortalBrandingEditor
                company={company}
                mode="org"
                readOnly={!open}
                onSaved={handleSaved}
              />
            ),
          },
          {
            key: 'general',
            label: <><SettingOutlined /> {tr('General & Access', 'Général & Accès')}</>,
            children: (
              <div className="og-grid">
                <section className="og-card og-span-7">
                  <div className="og-card-head"><span className="og-card-title"><SettingOutlined />{tr('Identity & language', 'Identité et langue')}</span></div>
                  <div className="og-card-body og-form">
                    <div className="og-brand-preview">
                      <LogoTile name={name || company.name} logoUrl={company.brand.logo_url} size="lg" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <strong>{name || company.name}</strong>
                        <em>{company.brand.branding?.tagline || tr('Exam preparation', 'Préparation aux examens')}</em>
                      </div>
                    </div>
                    <div className="og-field"><label>{tr('Name shown to learners', 'Nom affiché aux apprenants')}</label>
                      <Input value={name} onChange={e => setName(e.target.value)} maxLength={160} disabled={!open} /></div>
                    <div className="og-field"><label>{tr('Default language', 'Langue par défaut')}</label>
                      <Segmented value={language} onChange={v => setLanguage(v as 'fr' | 'en')} disabled={!open} options={[{ value: 'fr', label: 'Français' }, { value: 'en', label: 'English' }]} />
                      <small>{tr('Used for invitation emails and for learners who have not chosen a language.', 'Utilisée pour les emails d’invitation et pour les apprenants qui n’ont pas choisi de langue.')}</small></div>
                    <div className="og-foot"><ChangeButton type="primary" icon={<SaveOutlined />} onClick={saveGeneral} loading={saving} disabled={!dirty || !name.trim()}>{tr('Save', 'Enregistrer')}</ChangeButton></div>
                  </div>
                </section>

                <section className="og-card og-span-5">
                  <div className="og-card-head"><span className="og-card-title"><BankOutlined />{tr('Your access', 'Votre accès')}</span><StatePill company={company} /></div>
                  <div className="og-card-body og-form">
                    <div className="og-field"><label>{tr('Sign-in page for your learners', 'Page de connexion de vos apprenants')}</label>
                      <div className="og-copy"><span>{signIn}</span>
                        <Tooltip title={tr('Copy', 'Copier')}><Button size="small" type="text" icon={<CopyOutlined />}
                          onClick={() => navigator.clipboard?.writeText(signIn).then(() => message.success(tr('Link copied', 'Lien copié')))} /></Tooltip></div>
                      <small>{tr('Shows your custom company branding. Invitation emails already link here.', 'Affiche votre portail personnalisé. Les emails d’invitation pointent directement vers cette adresse.')}</small></div>
                    <div className="og-two">
                      <div className="og-field"><label>{tr('From', 'Du')}</label><span>{fmtDate(company.access_starts_at, locale)}</span></div>
                      <div className="og-field"><label>{tr('Until', 'Au')}</label><span>{fmtDate(company.access_ends_at, locale)}</span></div>
                    </div>
                    <div className="og-two">
                      <div className="og-field"><label>{tr('Package', 'Forfait')}</label><span>{tr(`${company.seats_used} / ${company.seat_limit} learner accounts`, `${company.seats_used} / ${company.seat_limit} comptes apprenants`)}</span></div>
                      <div className="og-field"><label>{tr('Official name', 'Nom officiel')}</label><span>{company.name}</span></div>
                    </div>
                    <div className="og-field"><label>{tr('Exams you may assign', 'Examens que vous pouvez attribuer')}</label>
                      <div className="og-cell-tags">{content.map(c => (
                        <span key={`${c.content_type}:${c.content_id}`} className={`ea-chip is-sm fam-${familyOfRef(c)}`}><b>{FAMILY_CODE[familyOfRef(c)]}</b>{c.name}</span>
                      ))}</div></div>
                    <small className="og-muted">{tr('To change your dates, seats, exams or credits, contact the administrator.', 'Pour modifier vos dates, places, examens ou crédits, contactez l’administrateur.')}</small>
                  </div>
                </section>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
};

export default OrgSettings;
