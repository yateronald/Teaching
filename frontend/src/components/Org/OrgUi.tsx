import React from 'react';
import { Button, Tooltip } from 'antd';
import type { ButtonProps } from 'antd';
import { useTr } from '../../utils/useTr';
import { apiAsset } from '../../utils/apiAsset';
import { stateOf } from './orgModel';
import { useCompanyOpen } from './useCompanyOpen';
import type { Company, SkillLevel } from './orgModel';
import '../Admin/ExamAdmin.css'; // skill colours (.fam-*) and the content tree
import './Org.css';

/* Small shared pieces of the company screens. */

export const PageHeader: React.FC<{
  overline: string; title: React.ReactNode; subtitle?: React.ReactNode; actions?: React.ReactNode; lead?: React.ReactNode;
}> = ({ overline, title, subtitle, actions, lead }) => (
  <header className="og-header">
    <div className="og-head-main">
      {lead}
      <div>
        <span className="og-overline">{overline}</span>
        <h1 className="og-title">{title}</h1>
        {subtitle && <p className="og-subtitle">{subtitle}</p>}
      </div>
    </div>
    {actions && <div className="og-actions">{actions}</div>}
  </header>
);

export const Kpi: React.FC<{ icon?: React.ReactNode; label: string; value: React.ReactNode; note?: React.ReactNode; warn?: boolean }> = ({ icon, label, value, note, warn }) => (
  <div className={`og-kpi${warn ? ' is-warn' : ''}`}>
    <span className="og-kpi-label">{icon}{label}</span>
    <span className="og-kpi-value">{value}</span>
    {note && <span className="og-kpi-note">{note}</span>}
  </div>
);

/** `english`: the administrator's console, which stays in English. */
export const StatePill: React.FC<{ company: Pick<Company, 'state' | 'days_left' | 'expiring_soon'>; english?: boolean }> = ({ company, english }) => {
  const { tr } = useTr();
  const s = stateOf(company, english ? (en: string) => en : tr);
  return <span className={`og-pill tone-${s.tone}`}>{s.label}</span>;
};

export const LogoTile: React.FC<{ name: string; logoUrl?: string | null; size?: 'sm' | 'md' | 'lg' }> = ({ name, logoUrl, size = 'md' }) => (
  <span className={`og-logo${size === 'sm' ? ' is-sm' : size === 'lg' ? ' is-lg' : ''}`} aria-hidden>
    {logoUrl ? <img src={apiAsset(logoUrl)} alt="" /> : (name || '?').slice(0, 1).toUpperCase()}
  </span>
);

export const Initials: React.FC<{ first?: string | null; last?: string | null }> = ({ first, last }) => (
  <span className="og-avatar" aria-hidden>{`${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase() || '?'}</span>
);

export const Level: React.FC<{ nclc: number | null | undefined; level?: SkillLevel | null }> = ({ nclc, level }) => {
  const { tr } = useTr();
  const n = nclc ?? level?.nclc ?? null;
  if (n == null && !level) return <span className="og-level is-none">—</span>;
  if (n == null) return <span className="og-level is-none">{tr('< NCLC 4', '< NCLC 4')}</span>;
  return <span className="og-level">NCLC {n}</span>;
};

export const Credits: React.FC<{ ee: number; eo: number }> = ({ ee, eo }) => {
  const { tr } = useTr();
  return (
    <span className="og-credits">
      <Tooltip title={tr('Writing credits', 'Crédits expression écrite')}><span className="is-ee">EE {ee}</span></Tooltip>
      <Tooltip title={tr('Speaking credits', 'Crédits expression orale')}><span className="is-eo">EO {eo}</span></Tooltip>
    </span>
  );
};

/**
 * A button that changes something in the company: greyed with an explanation
 * while the company is not open (expired, not started). The server refuses
 * these changes anyway; this only says so before anyone tries.
 */
export const ChangeButton: React.FC<ButtonProps> = (props) => {
  const { tr } = useTr();
  const { open, state } = useCompanyOpen();
  if (open) return <Button {...props} />;
  const why = state === 'not_started'
    ? tr('Available once your access starts.', 'Disponible dès l’ouverture de votre accès.')
    : tr('Your access has expired: contact the administrator.', 'Votre accès a expiré : contactez l’administrateur.');
  return (
    <Tooltip title={why}>
      <span className="og-locked"><Button {...props} disabled onClick={undefined} /></span>
    </Tooltip>
  );
};

export const Empty: React.FC<{ icon: React.ReactNode; title: string; text?: string; action?: React.ReactNode }> = ({ icon, title, text, action }) => (
  <div className="og-empty">{icon}<strong>{title}</strong>{text && <span>{text}</span>}{action}</div>
);
