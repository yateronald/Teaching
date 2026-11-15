import React, { useCallback, useEffect, useState } from 'react';
import { App as AntApp, Button, Input, Modal, Skeleton } from 'antd';
import { DeleteOutlined, SearchOutlined, StopOutlined, WarningOutlined } from '@ant-design/icons';
import { useAuth } from '../../../contexts/AuthContext';
import { call } from '../../Org/orgModel';
import { Empty } from '../../Org/OrgUi';
import { useTr } from '../../../utils/useTr';
import { emailError, fmtMoment, type EmailMeta, type EmailSettings } from './emailModel';


/* The sender's details: the postal address every campaign shows (Canada's
   anti-spam law), the address replies go to, the sender's name. */
export const SenderDetails: React.FC<{ open: boolean; meta: EmailMeta | null; onClose: () => void; onSaved: (s: EmailSettings) => void }> = ({ open, meta, onClose, onSaved }) => {
  const { apiCall } = useAuth();
  const { tr } = useTr();
  const { message } = AntApp.useApp();
  const [v, setV] = useState<EmailSettings>({ postal_address: '', reply_to: '', sender_name: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => { if (open && meta) { setV(meta.settings); setErr(null); } }, [open, meta]);

  const save = async () => {
    setBusy(true);
    setErr(null);
    try {
      const r = await call<{ settings: EmailSettings }>(apiCall, '/admin/email-campaigns/settings', 'PUT', v);
      message.success(tr('Sender details saved', 'Expéditeur enregistré'));
      onSaved(r.settings);
    } catch (e) { setErr(emailError(e, tr)); } finally { setBusy(false); }
  };

  return (
    <Modal open={open} onCancel={onClose} title={tr('Sender details', 'Expéditeur')} okText={tr('Save', 'Enregistrer')} cancelText={tr('Cancel', 'Annuler')} onOk={save} confirmLoading={busy} destroyOnHidden width={560}>
      <div className="og-form" style={{ gap: 14 }}>
        <div className="og-field"><label>{tr('From', 'De')}</label>
          <Input value={meta ? `${v.sender_name || meta.sender.name} <${meta.sender.email}>` : ''} disabled />
          <small>{tr('The address is the one verified in Brevo (EMAIL_FROM on the server). The name can change below.', 'L’adresse est celle vérifiée dans Brevo (EMAIL_FROM sur le serveur). Le nom peut changer ci-dessous.')}</small></div>
        <div className="og-field"><label>{tr('Sender name', 'Nom de l’expéditeur')} <em>{tr('optional', 'facultatif')}</em></label>
          <Input value={v.sender_name} onChange={e => setV({ ...v, sender_name: e.target.value })} maxLength={80} placeholder={meta?.sender.name} /></div>
        <div className="og-field"><label>{tr('Replies go to', 'Les réponses vont à')} <em>{tr('optional', 'facultatif')}</em></label>
          <Input value={v.reply_to} onChange={e => setV({ ...v, reply_to: e.target.value })} maxLength={254} placeholder={meta?.sender.email} /></div>
        <div className="og-field"><label>{tr('Postal address of the school', 'Adresse postale de l’école')}</label>
          <Input.TextArea value={v.postal_address} onChange={e => setV({ ...v, postal_address: e.target.value })} maxLength={240} autoSize={{ minRows: 2, maxRows: 3 }}
            placeholder={tr('e.g. 1234 Sainte-Catherine Street West, suite 500, Montréal (QC) H3G 1P1, Canada', 'ex. 1234 rue Sainte-Catherine Ouest, bureau 500, Montréal (QC) H3G 1P1, Canada')} />
          <small>{tr('Shown at the bottom of every campaign. Canada’s anti-spam law (CASL) requires a valid mailing address; a post office box works.', 'Affichée en bas de chaque email. La loi canadienne anti-pourriel (LCAP) exige une adresse postale valide ; une case postale convient.')}</small></div>
        {err && <div className="og-check tone-bad"><WarningOutlined /><span>{err}</span></div>}
      </div>
    </Modal>
  );
};

interface Suppression { email: string; reason: 'unsubscribed' | 'bounced' | 'complaint' | 'manual'; note: string | null; created_at: string }

/* Addresses that never receive a campaign: unsubscribed, bounced, removed by hand. */
export const Suppressions: React.FC<{ open: boolean; onClose: () => void; onChanged: () => void }> = ({ open, onClose, onChanged }) => {
  const { apiCall } = useAuth();
  const { tr, locale } = useTr();
  const { message, modal } = AntApp.useApp();
  const [rows, setRows] = useState<Suppression[] | null>(null);
  const [q, setQ] = useState('');
  const [add, setAdd] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const reason = (r: Suppression['reason']) => ({
    unsubscribed: tr('Unsubscribed', 'Désinscrit'), bounced: tr('Address bounced', 'Adresse rejetée'), complaint: tr('Marked as spam', 'Signalé comme indésirable'), manual: tr('Removed by hand', 'Retiré à la main'),
  }[r]);

  const load = useCallback(async () => {
    setErr(null);
    try { setRows((await call<{ suppressions: Suppression[] }>(apiCall, `/admin/email-campaigns/suppressions?q=${encodeURIComponent(q)}`)).suppressions); }
    catch (e) { setErr(emailError(e, tr)); }
  }, [apiCall, q, tr]);
  useEffect(() => { if (open) load(); }, [open, load]);

  const addAll = async () => {
    try {
      const r = await call<{ added: number }>(apiCall, '/admin/email-campaigns/suppressions', 'POST', { emails: add });
      message.success(tr(`${r.added} address(es) will never receive a campaign`, `${r.added} adresse(s) ne recevront plus de campagne`));
      setAdd('');
      load();
      onChanged();
    } catch (e) { message.error(emailError(e, tr)); }
  };
  const remove = (s: Suppression) => modal.confirm({
    title: tr(`Email ${s.email} again?`, `Écrire de nouveau à ${s.email} ?`),
    content: s.reason === 'manual'
      ? tr('This address will receive campaigns again.', 'Cette adresse recevra de nouveau les campagnes.')
      : tr('Only if the person asked to receive your emails again. Under Canada’s anti-spam law, an unsubscribe must be respected.', 'Seulement si la personne a demandé à recevoir de nouveau vos emails. La loi canadienne anti-pourriel impose de respecter une désinscription.'),
    okText: tr('Allow again', 'Autoriser de nouveau'), cancelText: tr('Cancel', 'Annuler'),
    onOk: async () => {
      try { await call(apiCall, `/admin/email-campaigns/suppressions/${encodeURIComponent(s.email)}`, 'DELETE'); load(); onChanged(); }
      catch (e) { message.error(emailError(e, tr)); }
    },
  });

  return (
    <Modal open={open} onCancel={onClose} footer={null} title={tr('Addresses that never receive a campaign', 'Adresses qui ne reçoivent jamais de campagne')} width={680} destroyOnHidden>
      <div className="og-form" style={{ gap: 12 }}>
        <div className="em-sup-add">
          <Input.TextArea value={add} onChange={e => setAdd(e.target.value)} autoSize={{ minRows: 1, maxRows: 4 }} placeholder={tr('Add addresses by hand (one per line, or separated by commas)', 'Ajouter des adresses à la main (une par ligne, ou séparées par des virgules)')} />
          <Button icon={<StopOutlined />} onClick={addAll} disabled={!add.trim()}>{tr('Add', 'Ajouter')}</Button>
        </div>
        <Input allowClear prefix={<SearchOutlined />} placeholder={tr('Search an address', 'Rechercher une adresse')} value={q} onChange={e => setQ(e.target.value)} />
        {err ? <div className="og-check tone-bad"><WarningOutlined /><span>{err}</span></div>
          : rows === null ? <Skeleton active paragraph={{ rows: 4 }} />
            : rows.length === 0 ? <Empty icon={<StopOutlined />} title={tr('Nobody', 'Personne')} text={tr('People who unsubscribe, addresses that bounce and the ones you add appear here.', 'Les désinscrits, les adresses rejetées et celles que vous ajoutez apparaissent ici.')} />
              : (
                <div className="em-sup-list">
                  {rows.map(s => (
                    <div key={s.email} className="em-sup-row">
                      <span className="og-cell-main"><strong>{s.email}</strong><em>{reason(s.reason)}{s.note ? ` · ${s.note}` : ''} · {fmtMoment(s.created_at, locale)}</em></span>
                      <Button type="text" size="small" icon={<DeleteOutlined />} onClick={() => remove(s)} aria-label={tr(`Allow ${s.email} again`, `Autoriser ${s.email} de nouveau`)} />
                    </div>
                  ))}
                </div>
              )}
      </div>
    </Modal>
  );
};
