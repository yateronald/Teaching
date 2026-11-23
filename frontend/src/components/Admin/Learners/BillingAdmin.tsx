// Online payment (Paystack), for the administrator: the Paystack addresses to
// paste in the dashboard, the prices, and every payment.
import { useCallback, useEffect, useState } from 'react';
import { Alert, App, Button, Form, Input, InputNumber, Modal, Segmented, Select, Skeleton, Switch, Table, Tag, Tooltip, Typography } from 'antd';
import { DownloadOutlined, EditOutlined, PlusOutlined, ReloadOutlined, SyncOutlined } from '@ant-design/icons';
import { useAuth } from '../../../contexts/AuthContext';
import { call, fmtDate } from '../../Org/orgModel';

interface OfferRow {
  id: number; code: string; name_en: string; name_fr: string; description_en: string | null; description_fr: string | null;
  days: number; amount: number; currency: string; recurring: boolean; paystack_plan_code: string | null; active: boolean; sort: number;
}
interface BillingInfo {
  mode: 'live' | 'test' | 'off'; callback_url: string | null; webhook_url: string | null; currencies: string[];
  merchant_currencies?: string[]; fx_usd_xof?: { rate: number; source: string } | null; offers: OfferRow[];
  stats: { paid: number; review: number; subscriptions: number; problems: number };
}
interface PaymentRow {
  id: number; reference: string; amount: number; currency: string; display_amount?: number; display_currency?: string;
  fx_rate?: number | null; invoice_number?: string | null; days: number; status: string; status_detail: string | null;
  created_at: string; paid_at: string | null; channel: string | null; renewal: boolean; first_name: string; last_name: string; email: string;
  offer: string | null; premium_until: string | null;
}

const L = 'en-CA';
const money = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat(L, { style: 'currency', currency, maximumFractionDigits: amount % 100 === 0 ? 0 : 2 }).format(amount / 100);
  } catch {
    return `${(amount / 100).toFixed(amount % 100 === 0 ? 0 : 2)} ${currency}`;
  }
};
const STATUS_COLOR: Record<string, string> = { success: 'green', review: 'orange', failed: 'red', abandoned: 'default', refunded: 'volcano', disputed: 'red', initialized: 'blue' };

export default function BillingAdmin() {
  const { apiCall } = useAuth();
  const { message } = App.useApp();
  const [info, setInfo] = useState<BillingInfo | null>(null);
  const [error, setError] = useState('');
  const [edit, setEdit] = useState<OfferRow | 'new' | null>(null);
  const [payments, setPayments] = useState<PaymentRow[] | null>(null);
  const [status, setStatus] = useState('all');
  const [q, setQ] = useState('');

  const load = useCallback(async () => {
    try { setInfo(await call<BillingInfo>(apiCall, '/admin/learners/billing')); setError(''); } catch (e) { setError((e as Error).message); }
  }, [apiCall]);
  const loadPayments = useCallback(async () => {
    const params = new URLSearchParams({ ...(status !== 'all' ? { status } : {}), ...(q.trim() ? { q: q.trim() } : {}) });
    try { setPayments((await call<{ rows: PaymentRow[] }>(apiCall, `/admin/learners/billing/payments?${params}`)).rows); } catch (e) { message.error((e as Error).message); }
  }, [apiCall, status, q, message]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { const t = setTimeout(loadPayments, 250); return () => clearTimeout(t); }, [loadPayments]);

  const recheck = async (p: PaymentRow) => {
    try {
      const r = await call<{ outcome: string }>(apiCall, `/admin/learners/billing/payments/${p.id}/recheck`, 'POST', {});
      message.info(`Paystack says: ${r.outcome}`);
      loadPayments();
    } catch (e) { message.error((e as Error).message); }
  };

  const downloadInvoice = async (p: PaymentRow) => {
    try {
      const res = await apiCall(`/admin/learners/billing/payments/${p.id}/invoice.pdf`);
      if (!res.ok) throw new Error('Could not generate invoice PDF.');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice-${p.invoice_number || p.reference}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (e) { message.error((e as Error).message); }
  };

  if (error) return <Alert type="warning" showIcon message={error} />;
  if (!info) return <Skeleton active />;
  const merchantCurrencies = info.merchant_currencies || [];
  const canAutoConvertUsd = merchantCurrencies.includes('XOF') && !merchantCurrencies.includes('USD');
  const isAutoConverted = (o: Pick<OfferRow, 'currency' | 'recurring'>) => !o.recurring && o.currency === 'USD' && canAutoConvertUsd;
  const unsupportedOffers = merchantCurrencies.length > 0
    ? info.offers.filter(o => o.active && !merchantCurrencies.includes(o.currency) && !isAutoConverted(o))
    : [];
  const approxXofSubunits = (usdSubunits: number) => {
    if (!info.fx_usd_xof?.rate) return null;
    return Math.max(100, Math.round((((usdSubunits / 100) * info.fx_usd_xof.rate) / 50)) * 50) * 100;
  };
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 20 }}>
      <section style={{ padding: 16, border: '1px solid #e2e8f0', borderRadius: 12, background: '#fff' }}>
        <h3 style={{ marginTop: 0 }}>Paystack {info.mode === 'live' ? <Tag color="green">Live</Tag> : info.mode === 'test' ? <Tag color="orange">Test mode</Tag> : <Tag color="red">Not configured</Tag>}</h3>
        {info.mode === 'off' && <p>Add <code>PAYSTACK_SECRET_KEY</code> to the server’s <code>backend/.env</code> and restart the API.</p>}
        <p style={{ marginBottom: 6 }}>Paste these two addresses in Paystack → Settings → API Keys &amp; Webhooks:</p>
        <div style={{ display: 'grid', gap: 4 }}>
          <span>Callback URL: {info.callback_url ? <Typography.Text copyable code>{info.callback_url}</Typography.Text> : <em>set API_PUBLIC_URL on the server</em>}</span>
          <span>Webhook URL: {info.webhook_url ? <Typography.Text copyable code>{info.webhook_url}</Typography.Text> : <em>set API_PUBLIC_URL on the server</em>}</span>
        </div>
        {merchantCurrencies.length > 0 && (
          <p style={{ margin: '10px 0 0' }}>
            Paystack settlement currency:{' '}
            {merchantCurrencies.map(cur => <Tag key={cur} color="blue">{cur}</Tag>)}
            {canAutoConvertUsd && info.fx_usd_xof && (
              <Tag color="cyan">USD prices auto-convert to XOF at checkout (1 USD ≈ {info.fx_usd_xof.rate} XOF · Invoices in USD)</Tag>
            )}
          </p>
        )}
        <p style={{ margin: '10px 0 0', color: '#64748b' }}>
          {info.stats.paid} paid · {info.stats.subscriptions} active subscription(s)
          {info.stats.review > 0 && <> · <Tag color="orange">{info.stats.review} to review</Tag></>}
          {info.stats.problems > 0 && <> · <Tag color="red">{info.stats.problems} notification problem(s) in 30 days</Tag></>}
        </p>
      </section>

      {unsupportedOffers.length > 0 && (
        <Alert
          type="error"
          showIcon
          message={`Paystack rejected ${unsupportedOffers.map(o => `"${o.name_en}" (${o.currency})`).join(', ')}: currency not enabled on Paystack`}
          description={`Your Paystack account accepts ${merchantCurrencies.join(', ')} (or one-time USD offers converted automatically to XOF).`}
        />
      )}

      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
          <h3 style={{ margin: 0 }}>Prices</h3>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setEdit('new')}>Add a price</Button>
        </div>
        <Table<OfferRow>
          rowKey="id" dataSource={info.offers} pagination={false} scroll={{ x: 760 }} locale={{ emptyText: 'No price yet: add one to open online payment.' }}
          columns={[
            { title: 'Offer', key: 'name', render: (_, o) => <span><strong>{o.name_en}</strong><div style={{ color: '#64748b', fontSize: 12 }}>{o.name_fr} · <code>{o.code}</code></div></span> },
            {
              title: 'Price', key: 'price', render: (_, o) => {
                const converted = isAutoConverted(o);
                const xofEst = converted ? approxXofSubunits(o.amount) : null;
                return (
                  <span>
                    {money(o.amount, o.currency)}
                    {converted && (
                      <Tag color="cyan" style={{ marginLeft: 6 }}>
                        Auto → {xofEst ? `~${money(xofEst, 'XOF')}` : 'XOF'}
                      </Tag>
                    )}
                    {!converted && merchantCurrencies.length > 0 && !merchantCurrencies.includes(o.currency) && (
                      <Tag color="red" style={{ marginLeft: 6 }}>Not enabled on Paystack</Tag>
                    )}
                  </span>
                );
              },
            },
            { title: 'Premium', key: 'days', render: (_, o) => `${o.days} days` },
            { title: 'Type', key: 'type', render: (_, o) => (o.recurring ? <Tooltip title={o.paystack_plan_code}><Tag color="gold">Recurring</Tag></Tooltip> : <Tag>One payment</Tag>) },
            { title: 'On sale', key: 'active', render: (_, o) => (o.active ? <Tag color="green">Yes</Tag> : <Tag>Hidden</Tag>) },
            { title: '', key: 'edit', align: 'right', render: (_, o) => <Button icon={<EditOutlined />} onClick={() => setEdit(o)}>Edit</Button> },
          ]}
        />
      </section>

      <section>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <h3 style={{ margin: 0 }}>Payments</h3>
          <Segmented value={status} onChange={v => setStatus(String(v))} options={[
            { label: 'All', value: 'all' }, { label: 'Paid', value: 'success' }, { label: 'To review', value: 'review' },
            { label: 'Failed', value: 'failed' }, { label: 'Refunded', value: 'refunded' }, { label: 'In progress', value: 'initialized' },
          ]} />
          <Input allowClear placeholder="Email or reference" value={q} onChange={e => setQ(e.target.value)} style={{ maxWidth: 260 }} />
          <Button icon={<ReloadOutlined />} onClick={() => { load(); loadPayments(); }}>Refresh</Button>
        </div>
        <Table<PaymentRow>
          rowKey="id" dataSource={payments || []} loading={!payments} pagination={false} scroll={{ x: 960 }}
          columns={[
            { title: 'Date', key: 'date', render: (_, p) => fmtDate(p.paid_at || p.created_at, L) },
            { title: 'Person', key: 'who', render: (_, p) => <span>{p.first_name} {p.last_name}<div style={{ color: '#64748b', fontSize: 12 }}>{p.email}</div></span> },
            { title: 'Offer', key: 'offer', render: (_, p) => <span>{p.offer || '—'}{p.renewal && <Tag style={{ marginLeft: 6 }}>renewal</Tag>}{p.invoice_number && <div style={{ color: '#64748b', fontSize: 12 }}><code>{p.invoice_number}</code></div>}</span> },
            {
              title: 'Amount', key: 'amount', render: (_, p) => {
                const dispCur = p.display_currency || p.currency;
                const dispAmt = p.display_amount ?? p.amount;
                const converted = dispCur !== p.currency;
                return (
                  <span>
                    <strong>{money(dispAmt, dispCur)}</strong>
                    {converted && <div style={{ color: '#64748b', fontSize: 12 }}>Settled: {money(p.amount, p.currency)}</div>}
                  </span>
                );
              },
            },
            {
              title: 'Status', key: 'status', render: (_, p) => (
                <span><Tag color={STATUS_COLOR[p.status] || 'default'}>{p.status}</Tag>
                  {p.status_detail && <div style={{ color: '#64748b', fontSize: 12, maxWidth: 260 }}>{p.status_detail}</div>}
                  {p.status === 'success' && p.premium_until && <div style={{ color: '#64748b', fontSize: 12 }}>Premium until {fmtDate(p.premium_until, L)}</div>}</span>
              ),
            },
            { title: 'Reference', key: 'ref', render: (_, p) => <Typography.Text copyable={{ text: p.reference }} style={{ fontSize: 12 }}>{p.reference.slice(0, 18)}…</Typography.Text> },
            {
              title: '', key: 'act', align: 'right', render: (_, p) => (
                p.status === 'success'
                  ? <Button icon={<DownloadOutlined />} size="small" onClick={() => void downloadInvoice(p)}>Invoice PDF</Button>
                  : ['initialized', 'review'].includes(p.status)
                    ? <Button icon={<SyncOutlined />} size="small" onClick={() => recheck(p)}>Ask Paystack</Button>
                    : null
              ),
            },
          ]}
        />
      </section>

      {edit && <OfferModal offer={edit === 'new' ? null : edit} currencies={info.currencies} merchantCurrencies={merchantCurrencies} onClose={() => setEdit(null)} onSaved={() => { setEdit(null); load(); }} />}
    </div>
  );
}

function OfferModal({ offer, currencies, merchantCurrencies, onClose, onSaved }: { offer: OfferRow | null; currencies: string[]; merchantCurrencies: string[]; onClose: () => void; onSaved: () => void }) {
  const { apiCall } = useAuth();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [busy, setBusy] = useState(false);
  const recurring = Form.useWatch('recurring', form);
  const selectedCurrency = Form.useWatch('currency', form) as string | undefined;
  const canConvertUsd = !recurring && selectedCurrency === 'USD' && merchantCurrencies.includes('XOF');
  const currencyMismatch = Boolean(selectedCurrency && merchantCurrencies.length > 0 && !merchantCurrencies.includes(selectedCurrency) && !canConvertUsd);
  const save = async () => {
    const v = await form.validateFields();
    // Paystack counts in the currency's smallest unit (×100).
    const body = { ...v, amount: Math.round(Number(v.price) * 100), price: undefined };
    setBusy(true);
    try {
      if (offer) await call(apiCall, `/admin/learners/billing/offers/${offer.id}`, 'PUT', body);
      else await call(apiCall, '/admin/learners/billing/offers', 'POST', body);
      message.success('Price saved');
      onSaved();
    } catch (e) { message.error((e as Error).message); } finally { setBusy(false); }
  };
  const defaultCurrency = currencies.includes('USD') && merchantCurrencies.includes('XOF') ? 'USD' : (merchantCurrencies[0] || currencies[0]);
  return (
    <Modal open title={offer ? 'Edit the price' : 'New price'} onCancel={onClose} onOk={save} okText="Save" confirmLoading={busy} width={640} destroyOnHidden>
      <Form form={form} layout="vertical" initialValues={offer
        ? { ...offer, price: offer.amount / 100 }
        : { days: 30, currency: defaultCurrency, recurring: false, active: false, sort: 0 }}>
        {currencyMismatch && (
          <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 14 }}
            message={`${selectedCurrency} is not currently enabled on your Paystack account (enabled: ${merchantCurrencies.join(', ')}).`}
          />
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Form.Item name="name_en" label="Name (English)" rules={[{ required: true, max: 80 }]}><Input placeholder="Premium, 1 month" /></Form.Item>
          <Form.Item name="name_fr" label="Name (French)" rules={[{ required: true, max: 80 }]}><Input placeholder="Premium, 1 mois" /></Form.Item>
          <Form.Item name="description_en" label="Short line (English)"><Input maxLength={300} /></Form.Item>
          <Form.Item name="description_fr" label="Short line (French)"><Input maxLength={300} /></Form.Item>
          <Form.Item name="price" label="Price" rules={[{ required: true, type: 'number', min: 0.01 }]}
            extra="Enter the normal display price (e.g. 30 for $30 USD). One-time USD offers automatically convert to XOF at Paystack checkout while staying in USD on site & invoices.">
            <InputNumber style={{ width: '100%' }} min={0.01} step={5} />
          </Form.Item>
          <Form.Item name="currency" label="Currency" rules={[{ required: true }]} extra="USD one-time offers auto-convert to XOF at Paystack checkout.">
            <Select options={currencies.map(c => ({
              value: c,
              label: merchantCurrencies.length > 0
                ? merchantCurrencies.includes(c)
                  ? `${c} (enabled directly on Paystack)`
                  : c === 'USD' && merchantCurrencies.includes('XOF')
                    ? `${c} (public & invoice in USD → auto XOF checkout)`
                    : `${c} (not enabled on Paystack)`
                : c,
            }))} />
          </Form.Item>
          <Form.Item name="days" label="Premium for (days)" rules={[{ required: true, type: 'number', min: 1, max: 3660 }]}><InputNumber style={{ width: '100%' }} min={1} max={3660} /></Form.Item>
          <Form.Item name="code" label="Code" rules={[{ required: true, pattern: /^[a-z0-9][a-z0-9-]{1,38}$/, message: 'Lower-case letters, digits and dashes' }]}><Input placeholder="premium-1-month" /></Form.Item>
          <Form.Item name="recurring" label="Renews automatically" valuePropName="checked"><Switch /></Form.Item>
          <Form.Item name="paystack_plan_code" label="Paystack plan code" rules={[{ required: !!recurring, pattern: /^PLN_[A-Za-z0-9]+$/, message: 'PLN_… from Paystack → Plans' }]}
            extra="Recurring only: create the plan in Paystack with the same price and interval.">
            <Input placeholder="PLN_…" disabled={!recurring} />
          </Form.Item>
          <Form.Item name="active" label="On sale" valuePropName="checked"><Switch /></Form.Item>
          <Form.Item name="sort" label="Order"><InputNumber min={0} max={999} /></Form.Item>
        </div>
      </Form>
    </Modal>
  );
}
