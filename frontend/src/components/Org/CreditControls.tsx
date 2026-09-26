import React from 'react';
import { InputNumber } from 'antd';
import { AudioOutlined, CheckOutlined, CheckCircleFilled, EditOutlined, WarningFilled } from '@ant-design/icons';
import type { Lang } from '../../utils/useTr';
import { CREDIT_KINDS, creditName } from './orgModel';
import type { CreditType } from './orgModel';

/* Shared by the company's credits page, its "Give credits" dialog and the
   administrator's reserve dialog: pick writing, speaking or both, one amount
   box per kind, and a summary that says exactly what will move. */

export type Amounts = Partial<Record<CreditType, number | null>>;

const KIND_ICON: Record<CreditType, React.ReactNode> = { ee: <EditOutlined />, eo: <AudioOutlined /> };

/** Writing (EE), speaking (EO) or both; at least one stays chosen. */
export const KindPicker: React.FC<{
  value: CreditType[];
  onChange: (v: CreditType[]) => void;
  lang: Lang;
  note?: (t: CreditType) => React.ReactNode;
}> = ({ value, onChange, lang, note }) => {
  const toggle = (t: CreditType) => {
    const on = value.includes(t);
    if (on && value.length === 1) return; // one kind at least
    onChange(CREDIT_KINDS.filter(k => (k === t ? !on : value.includes(k))));
  };
  return (
    <div className="og-kinds" role="group">
      {CREDIT_KINDS.map(t => {
        const on = value.includes(t);
        return (
          <button key={t} type="button" role="checkbox" aria-checked={on} className={`og-kind${on ? ' is-on' : ''}`} onClick={() => toggle(t)}>
            <span className="og-kind-ic">{KIND_ICON[t]}</span>
            <span className="og-kind-text"><strong>{creditName(t, lang)} <b>{t.toUpperCase()}</b></strong>{note && <em>{note(t)}</em>}</span>
            <span className="og-kind-tick" aria-hidden><CheckOutlined /></span>
          </button>
        );
      })}
    </div>
  );
};

/** One number box per chosen kind, side by side. */
export const AmountBoxes: React.FC<{
  kinds: CreditType[];
  values: Amounts;
  onChange: (v: Amounts) => void;
  label: (t: CreditType) => React.ReactNode;
  hint?: (t: CreditType) => React.ReactNode;
  min?: number;
  max?: number;
}> = ({ kinds, values, onChange, label, hint, min = 1, max = 100000 }) => (
  <div className="og-amounts">
    {kinds.map(t => (
      <div key={t} className="og-field">
        <label><span className="og-code">{t.toUpperCase()}</span>{label(t)}</label>
        <InputNumber min={min} max={max} precision={0} value={values[t] ?? null} onChange={v => onChange({ ...values, [t]: v })}
          style={{ width: '100%' }} size="large" aria-label={`${t.toUpperCase()}`} />
        {hint && <small>{hint(t)}</small>}
      </div>
    ))}
  </div>
);

export interface ReceiptLine { kind: CreditType; what: React.ReactNode; detail?: React.ReactNode; total: React.ReactNode; ok: boolean }

/** What will move, one line per kind, with a clear ok / not-ok mark. */
export const CreditReceipt: React.FC<{ lines: ReceiptLine[]; foot?: React.ReactNode }> = ({ lines, foot }) => (
  <div className="og-receipt" aria-live="polite">
    {lines.map(l => (
      <div key={l.kind} className={`og-receipt-row ${l.ok ? 'is-ok' : 'is-bad'}`}>
        <span className="og-code">{l.kind.toUpperCase()}</span>
        <span className="og-receipt-what">{l.what}{l.detail && <em>{l.detail}</em>}</span>
        <span className="og-receipt-total">{l.total}{l.ok ? <CheckCircleFilled /> : <WarningFilled />}</span>
      </div>
    ))}
    {foot && <div className="og-receipt-foot">{foot}</div>}
  </div>
);
