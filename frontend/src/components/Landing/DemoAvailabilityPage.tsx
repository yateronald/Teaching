import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, ConfigProvider, DatePicker, Input, Select, Spin, TimePicker } from 'antd';
import {
  CalendarOutlined, CheckCircleFilled, ClockCircleOutlined, DeleteOutlined,
  ExclamationCircleFilled, MailOutlined, PlusOutlined, SendOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { COMMON_TIMEZONES } from '../../utils/timezone';
import './DemoAvailabilityPage.css';

const API_BASE = ((import.meta.env.VITE_API_BASE_URL as string | undefined) || 'https://api.learnfrenchwithnatives.com/api').replace(/\/$/, '');

type LinkStatus = 'loading' | 'pending' | 'submitted' | 'expired' | 'superseded' | 'invalid';

interface AvailabilityMeta {
  status: Exclude<LinkStatus, 'loading'>;
  first_name?: string;
  admin_name?: string;
  requester_timezone?: string | null;
  proposed_timezone?: string;
  proposed_start_date?: string;
  proposed_end_date?: string;
  proposed_time_start?: string;
  proposed_time_end?: string;
  admin_note?: string | null;
  expires_at?: string;
  submitted_at?: string;
  support_email?: string;
}

interface SlotDraft {
  id: number;
  date: dayjs.Dayjs | null;
  start: dayjs.Dayjs | null;
  end: dayjs.Dayjs | null;
}

function browserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

const DemoAvailabilityPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<LinkStatus>('loading');
  const [meta, setMeta] = useState<AvailabilityMeta | null>(null);
  const [justSubmitted, setJustSubmitted] = useState(false);

  const [timezone, setTimezone] = useState(browserTimezone);
  const [slots, setSlots] = useState<SlotDraft[]>([
    { id: 1, date: null, start: dayjs('10:00', 'HH:mm'), end: dayjs('11:00', 'HH:mm') },
  ]);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'Share Your Availability — Learn French with Natives';
    const m = document.createElement('meta');
    m.name = 'robots';
    m.content = 'noindex, nofollow';
    document.head.appendChild(m);
    return () => {
      document.title = prevTitle;
      m.remove();
    };
  }, []);

  useEffect(() => {
    if (!token) { setStatus('invalid'); return; }
    let cancelled = false;
    (async () => {
      try {
        const resp = await fetch(`${API_BASE}/public/demo-availability/${encodeURIComponent(token)}`);
        const data: AvailabilityMeta = await resp.json().catch(() => ({ status: 'invalid' }));
        if (cancelled) return;
        setMeta(data);
        setStatus(data.status || (resp.ok ? 'pending' : 'invalid'));
        if (data.status === 'pending') {
          if (data.requester_timezone) setTimezone(data.requester_timezone);
          if (data.proposed_start_date) {
            setSlots([
              {
                id: 1,
                date: dayjs(data.proposed_start_date),
                start: dayjs(data.proposed_time_start || '10:00', 'HH:mm'),
                end: dayjs(data.proposed_time_end || '11:00', 'HH:mm'),
              },
            ]);
          }
        }
      } catch {
        if (!cancelled) setStatus('invalid');
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  const tzOptions = React.useMemo(() => {
    const list = COMMON_TIMEZONES.map(t => ({ value: t.value, label: t.label }));
    if (timezone && !list.some(t => t.value === timezone)) {
      list.unshift({ value: timezone, label: timezone });
    }
    return list;
  }, [timezone]);

  const addSlot = () => {
    if (slots.length >= 5) return;
    setSlots(prev => [
      ...prev,
      {
        id: Date.now(),
        date: meta?.proposed_start_date ? dayjs(meta.proposed_start_date) : null,
        start: dayjs(meta?.proposed_time_start || '14:00', 'HH:mm'),
        end: dayjs(meta?.proposed_time_end || '15:00', 'HH:mm'),
      },
    ]);
  };

  const updateSlot = (id: number, patch: Partial<SlotDraft>) => {
    setSlots(prev => prev.map(s => (s.id === id ? { ...s, ...patch } : s)));
    setError(null);
  };

  const removeSlot = (id: number) => {
    if (slots.length <= 1) return;
    setSlots(prev => prev.filter(s => s.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const payloadSlots: { date: string; start: string; end: string }[] = [];
    for (const s of slots) {
      if (!s.date || !s.start || !s.end) {
        setError('Please select a date, start time, and end time for every availability slot.');
        return;
      }
      const startStr = s.start.format('HH:mm');
      const endStr = s.end.format('HH:mm');
      if (endStr <= startStr) {
        setError('Each slot end time must be after its start time.');
        return;
      }
      payloadSlots.push({ date: s.date.format('YYYY-MM-DD'), start: startStr, end: endStr });
    }

    setSubmitting(true);
    try {
      const resp = await fetch(`${API_BASE}/public/demo-availability/${encodeURIComponent(token || '')}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timezone,
          slots: payloadSlots,
          note: note.trim() || undefined,
        }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        if (resp.status === 409 || data.code === 'ALREADY_SUBMITTED') {
          setMeta(m => ({ ...(m || { status: 'submitted' }), ...data, status: 'submitted' }));
          setStatus('submitted');
          return;
        }
        if (resp.status === 410 || data.code === 'EXPIRED') {
          setMeta(m => ({ ...(m || { status: 'expired' }), ...data, status: 'expired' }));
          setStatus('expired');
          return;
        }
        setError(data.error || 'Could not submit your availability.');
        return;
      }

      setJustSubmitted(true);
      setStatus('submitted');
    } catch {
      setError('Network error — please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const support = meta?.support_email || 'support@learnfrenchwithnatives.com';

  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#4f46e5', borderRadius: 10, fontSize: 14 } }}>
      <div className="dap-page">
        <header className="dap-topbar">
          <div className="dap-brand">
            <img src="/assets/Logo.png" alt="Learn French with Natives" />
            <span>Learn French with Natives</span>
          </div>
        </header>

        <main className="dap-wrap">
          <div className="dap-card">
            {status === 'loading' && (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <Spin size="large" />
                <p style={{ marginTop: 14, color: '#64748b' }}>Loading your scheduling link…</p>
              </div>
            )}

            {status === 'pending' && meta && (
              <form onSubmit={handleSubmit}>
                <div className="dap-eyebrow">Demo class scheduling</div>
                <h1 className="dap-title">Hi {meta.first_name || 'there'}, share your availability</h1>
                <p className="dap-sub">
                  Pick one or more date &amp; time windows when you are available. Once you confirm, our team will book your live demo meeting and email you the join link.
                </p>

                <div className="dap-window">
                  <div className="dap-window-title">Team’s suggested window</div>
                  <div className="dap-window-grid">
                    <div className="dap-window-item">
                      <span><CalendarOutlined /> Dates</span>
                      <strong>
                        {meta.proposed_start_date === meta.proposed_end_date
                          ? meta.proposed_start_date
                          : `${meta.proposed_start_date} → ${meta.proposed_end_date}`}
                      </strong>
                    </div>
                    <div className="dap-window-item">
                      <span><ClockCircleOutlined /> Daily hours</span>
                      <strong>{meta.proposed_time_start} – {meta.proposed_time_end}</strong>
                    </div>
                    <div className="dap-window-item">
                      <span>Timezone</span>
                      <strong>{meta.proposed_timezone}</strong>
                    </div>
                  </div>
                  {meta.admin_note && (
                    <div className="dap-admin-note">
                      <strong>Message from {meta.admin_name || 'our team'}:</strong> {meta.admin_note}
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                    Your timezone *
                  </label>
                  <Select
                    showSearch
                    style={{ width: '100%' }}
                    size="large"
                    value={timezone}
                    onChange={setTimezone}
                    options={tzOptions}
                    optionFilterProp="label"
                  />
                </div>

                <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: 13, fontWeight: 600 }}>Your preferred date &amp; time windows *</label>
                  {slots.length < 5 && (
                    <Button type="link" size="small" icon={<PlusOutlined />} onClick={addSlot}>
                      Add another option
                    </Button>
                  )}
                </div>

                {slots.map((s, idx) => (
                  <div key={s.id} className="dap-slot">
                    <div className="dap-slot-field">
                      <label>Date {slots.length > 1 ? `#${idx + 1}` : ''}</label>
                      <DatePicker
                        style={{ width: '100%' }}
                        size="large"
                        value={s.date}
                        disabledDate={cur => cur && cur.isBefore(dayjs().startOf('day'))}
                        onChange={d => updateSlot(s.id, { date: d })}
                      />
                    </div>
                    <div className="dap-slot-field">
                      <label>From</label>
                      <TimePicker
                        style={{ width: '100%' }}
                        size="large"
                        format="HH:mm"
                        minuteStep={15}
                        value={s.start}
                        onChange={t => updateSlot(s.id, { start: t })}
                      />
                    </div>
                    <div className="dap-slot-field">
                      <label>To</label>
                      <TimePicker
                        style={{ width: '100%' }}
                        size="large"
                        format="HH:mm"
                        minuteStep={15}
                        value={s.end}
                        onChange={t => updateSlot(s.id, { end: t })}
                      />
                    </div>
                    <Button
                      danger
                      type="text"
                      icon={<DeleteOutlined />}
                      disabled={slots.length <= 1}
                      onClick={() => removeSlot(s.id)}
                      aria-label="Remove slot"
                    />
                  </div>
                ))}

                <div style={{ marginTop: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                    Optional note
                  </label>
                  <Input.TextArea
                    rows={3}
                    maxLength={800}
                    placeholder="Anything we should know about your schedule or goals?"
                    value={note}
                    onChange={e => setNote(e.target.value)}
                  />
                </div>

                <div className="dap-once">
                  <strong>One-time link:</strong> This link expires immediately after you submit so your availability cannot be overwritten accidentally.
                </div>

                {error && (
                  <div style={{ marginTop: 14, padding: '10px 12px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: 13 }} role="alert">
                    {error}
                  </div>
                )}

                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  loading={submitting}
                  icon={<SendOutlined />}
                  style={{ marginTop: 18, height: 48, fontWeight: 600 }}
                >
                  Send my availability
                </Button>
              </form>
            )}

            {status === 'submitted' && (
              <div className="dap-state">
                <div className="dap-state-ic is-ok"><CheckCircleFilled /></div>
                <h2>{justSubmitted ? 'Availability submitted!' : 'Availability already submitted — link expired'}</h2>
                <p>
                  {justSubmitted
                    ? 'Thank you! We received your preferred times and have notified our coordinator. This one-time link is now closed. You will receive an email with your live meeting link and passcode once your session is confirmed.'
                    : 'Your availability has already been received, so this single-use link has expired and cannot be submitted again.'}
                </p>
                <div className="dap-reschedule-box">
                  <strong>Made a mistake or need to reschedule?</strong>
                  <div style={{ marginTop: 6 }}>
                    Send us an email at <a href={`mailto:${support}`}>{support}</a> and we will update your time or send you a fresh link.
                  </div>
                  <Button
                    style={{ marginTop: 12 }}
                    icon={<MailOutlined />}
                    href={`mailto:${support}?subject=${encodeURIComponent('Reschedule French Demo Availability')}`}
                  >
                    Email {support}
                  </Button>
                </div>
              </div>
            )}

            {(status === 'expired' || status === 'superseded' || status === 'invalid') && (
              <div className="dap-state">
                <div className="dap-state-ic is-warn"><ExclamationCircleFilled /></div>
                <h2>
                  {status === 'superseded'
                    ? 'This link has been replaced'
                    : status === 'expired'
                      ? 'This availability link has expired'
                      : 'Link not found'}
                </h2>
                <p>
                  {status === 'superseded'
                    ? 'A newer availability link was sent to your email. Please use the most recent email from our team, or contact us below.'
                    : 'This scheduling link is no longer active and cannot be used.'}
                </p>
                <div className="dap-reschedule-box">
                  <strong>Need a new link or want to reschedule?</strong>
                  <div style={{ marginTop: 6 }}>
                    Write to <a href={`mailto:${support}`}>{support}</a> and we will send you a fresh scheduling link.
                  </div>
                  <Button
                    type="primary"
                    style={{ marginTop: 12 }}
                    icon={<MailOutlined />}
                    href={`mailto:${support}?subject=${encodeURIComponent('Request a new demo availability link')}`}
                  >
                    Contact {support}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </ConfigProvider>
  );
};

export default DemoAvailabilityPage;
