import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, ConfigProvider, DatePicker, Input, Select, Spin, TimePicker } from 'antd';
import {
  CalendarOutlined, CheckCircleFilled, CheckOutlined, ClockCircleOutlined, DeleteOutlined,
  ExclamationCircleFilled, MailOutlined, PlusOutlined, SendOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { COMMON_TIMEZONES } from '../../utils/timezone';
import './DemoAvailabilityPage.css';

const API_BASE = ((import.meta.env.VITE_API_BASE_URL as string | undefined) || 'https://api.learnfrenchwithnatives.com/api').replace(/\/$/, '');

type LinkStatus = 'loading' | 'pending' | 'submitted' | 'expired' | 'superseded' | 'invalid';

interface ProposedSlot {
  date: string;
  end_date?: string | null;
  start: string;
  end: string;
}

interface AvailabilityMeta {
  status: Exclude<LinkStatus, 'loading'>;
  first_name?: string;
  requester_timezone?: string | null;
  proposed_timezone?: string;
  proposed_start_date?: string;
  proposed_end_date?: string;
  proposed_time_start?: string;
  proposed_time_end?: string;
  proposed_slots?: ProposedSlot[] | null;
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

interface DisplayDay {
  key: string;
  chipLabel: string;
  weekdayShort: string;
  dayNum: string;
  monthShort: string;
  fullDateLabel: string;
  timeLabel: string;
  originalLabel: string | null;
  localDate: string;
  localStart: string;
  localEnd: string;
}

interface DisplayGroup {
  optionIndex: number;
  isRange: boolean;
  rangeTitle: string;
  timeLabel: string;
  originalLabel: string | null;
  days: DisplayDay[];
}

function browserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

function zonedDateTimeToUtc(dateStr: string, timeStr: string, timeZone: string): Date | null {
  const dm = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  const tm = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(timeStr);
  if (!dm || !tm) return null;
  const targetAsUtc = Date.UTC(Number(dm[1]), Number(dm[2]) - 1, Number(dm[3]), Number(tm[1]), Number(tm[2]), 0);

  const offsetAt = (utcMs: number): number => {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).formatToParts(new Date(utcMs));
    const num = (t: string) => Number(parts.find(p => p.type === t)?.value || 0);
    const asUtc = Date.UTC(num('year'), num('month') - 1, num('day'), num('hour') % 24, num('minute'), num('second'));
    return asUtc - utcMs;
  };

  try {
    const o1 = offsetAt(targetAsUtc);
    const o2 = offsetAt(targetAsUtc - o1);
    return new Date(targetAsUtc - o2);
  } catch {
    return new Date(targetAsUtc);
  }
}

function extractInTz(date: Date, timeZone: string) {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(date);
    const get = (t: string) => parts.find(p => p.type === t)?.value || '00';
    const hh = String(Number(get('hour')) % 24).padStart(2, '0');
    return {
      isoDate: `${get('year')}-${get('month')}-${get('day')}`,
      hm: `${hh}:${get('minute')}`,
    };
  } catch {
    return {
      isoDate: date.toISOString().slice(0, 10),
      hm: date.toISOString().slice(11, 16),
    };
  }
}

function format12h(hm: string): string {
  const m = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(hm);
  if (!m) return hm;
  const h24 = Number(m[1]);
  const period = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 || 12;
  return `${h12}:${m[2]} ${period}`;
}

function expandIsoDates(startIso: string, endIso?: string | null): string[] {
  const dmStart = /^(\d{4})-(\d{2})-(\d{2})$/.exec(startIso);
  if (!dmStart) return [startIso];
  if (!endIso || endIso <= startIso) return [startIso];
  const dmEnd = /^(\d{4})-(\d{2})-(\d{2})$/.exec(endIso);
  if (!dmEnd) return [startIso];

  const startMs = Date.UTC(Number(dmStart[1]), Number(dmStart[2]) - 1, Number(dmStart[3]));
  const endMs = Date.UTC(Number(dmEnd[1]), Number(dmEnd[2]) - 1, Number(dmEnd[3]));
  const out: string[] = [];
  for (let ms = startMs, count = 0; ms <= endMs && count < 31; ms += 86400000, count += 1) {
    out.push(new Date(ms).toISOString().slice(0, 10));
  }
  return out.length > 0 ? out : [startIso];
}

function convertDayForDisplay(
  dateStr: string,
  start: string,
  end: string,
  fromTz: string,
  toTz: string,
  key: string,
): DisplayDay {
  const startUtc = zonedDateTimeToUtc(dateStr, start, fromTz);
  const endUtc = zonedDateTimeToUtc(dateStr, end, fromTz);

  if (!startUtc || !endUtc) {
    return {
      key,
      chipLabel: dateStr,
      weekdayShort: 'DATE',
      dayNum: '--',
      monthShort: '',
      fullDateLabel: dateStr,
      timeLabel: `${start} - ${end}`,
      originalLabel: null,
      localDate: dateStr,
      localStart: start,
      localEnd: end,
    };
  }

  const startLocal = extractInTz(startUtc, toTz);
  const endLocal = extractInTz(endUtc, toTz);
  const crossesMidnight = endLocal.isoDate !== startLocal.isoDate;

  let weekdayShort = 'DAY';
  let dayNum = startLocal.isoDate.slice(8, 10);
  let monthShort = '';
  let fullDateLabel = startLocal.isoDate;
  let chipLabel = startLocal.isoDate;
  try {
    weekdayShort = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: toTz }).format(startUtc).toUpperCase();
    dayNum = new Intl.DateTimeFormat('en-US', { day: 'numeric', timeZone: toTz }).format(startUtc);
    monthShort = new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: toTz }).format(startUtc).toUpperCase();
    fullDateLabel = new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: toTz,
    }).format(startUtc);
    chipLabel = new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      timeZone: toTz,
    }).format(startUtc);
  } catch { /* fallback already set */ }

  const timeLabel = `${format12h(startLocal.hm)} - ${format12h(endLocal.hm)}${crossesMidnight ? ' (+1 day)' : ''}`;
  const originalLabel = fromTz !== toTz
    ? `${format12h(start)} - ${format12h(end)} (${fromTz.replace(/_/g, ' ')})`
    : null;

  return {
    key,
    chipLabel,
    weekdayShort,
    dayNum,
    monthShort,
    fullDateLabel,
    timeLabel,
    originalLabel,
    localDate: startLocal.isoDate,
    localStart: startLocal.hm,
    localEnd: crossesMidnight || endLocal.hm <= startLocal.hm ? '23:59' : endLocal.hm,
  };
}

const DemoAvailabilityPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<LinkStatus>('loading');
  const [meta, setMeta] = useState<AvailabilityMeta | null>(null);
  const [justSubmitted, setJustSubmitted] = useState(false);

  const [timezone, setTimezone] = useState(browserTimezone);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [showCustomSlots, setShowCustomSlots] = useState(false);
  const [customSlots, setCustomSlots] = useState<SlotDraft[]>([
    { id: 1, date: null, start: dayjs('10:00', 'HH:mm'), end: dayjs('11:00', 'HH:mm') },
  ]);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedSummary, setSubmittedSummary] = useState<{ date: string; start: string; end: string }[]>([]);

  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'Choose Your Demo Time | Learn French with Natives';
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
          const hasOptions = Array.isArray(data.proposed_slots) && data.proposed_slots.length > 0;
          setShowCustomSlots(!hasOptions);
          if (!hasOptions && data.proposed_start_date) {
            setCustomSlots([
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

  const tzOptions = useMemo(() => {
    const list = COMMON_TIMEZONES.map(t => ({ value: t.value, label: t.label }));
    if (timezone && !list.some(t => t.value === timezone)) {
      list.unshift({ value: timezone, label: timezone });
    }
    return list;
  }, [timezone]);

  const hasProposedOptions = !!(meta?.proposed_slots && meta.proposed_slots.length > 0);
  const displayGroups: DisplayGroup[] = useMemo(() => {
    if (!meta?.proposed_slots || meta.proposed_slots.length === 0) return [];
    const fromTz = meta.proposed_timezone || 'UTC';
    return meta.proposed_slots.map((sl, optionIndex) => {
      const dates = expandIsoDates(sl.date, sl.end_date);
      const isRange = dates.length > 1;
      const days = dates.map((d) =>
        convertDayForDisplay(d, sl.start, sl.end, fromTz, timezone, `${optionIndex}:${d}`)
      );
      const firstDay = days[0];
      const lastDay = days[days.length - 1];
      const rangeTitle = isRange && firstDay && lastDay
        ? `${firstDay.chipLabel} to ${lastDay.chipLabel}`
        : (firstDay?.fullDateLabel || sl.date);
      return {
        optionIndex,
        isRange,
        rangeTitle,
        timeLabel: firstDay?.timeLabel || `${sl.start} - ${sl.end}`,
        originalLabel: firstDay?.originalLabel || null,
        days,
      };
    });
  }, [meta?.proposed_slots, meta?.proposed_timezone, timezone]);

  const flatDayLookup = useMemo(() => {
    const map = new Map<string, DisplayDay>();
    for (const grp of displayGroups) {
      for (const day of grp.days) {
        map.set(day.key, day);
      }
    }
    return map;
  }, [displayGroups]);

  const toggleDayKey = (key: string) => {
    setError(null);
    setSelectedKeys(prev => (
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    ));
  };

  const toggleCustomMode = () => {
    setError(null);
    setShowCustomSlots(prev => {
      const next = !prev;
      if (next && customSlots.length === 0) {
        setCustomSlots([
          { id: Date.now(), date: dayjs().add(1, 'day'), start: dayjs('10:00', 'HH:mm'), end: dayjs('11:00', 'HH:mm') },
        ]);
      }
      return next;
    });
  };

  const addCustomSlot = () => {
    if (customSlots.length >= 5) return;
    setError(null);
    const last = customSlots[customSlots.length - 1];
    setCustomSlots(prev => [
      ...prev,
      {
        id: Date.now() + prev.length + 1,
        date: last?.date ? last.date.add(1, 'day') : (meta?.proposed_start_date ? dayjs(meta.proposed_start_date) : null),
        start: dayjs(meta?.proposed_time_start || '14:00', 'HH:mm'),
        end: dayjs(meta?.proposed_time_end || '15:00', 'HH:mm'),
      },
    ]);
  };

  const updateCustomSlot = (id: number, patch: Partial<SlotDraft>) => {
    setCustomSlots(prev => prev.map(s => (s.id === id ? { ...s, ...patch } : s)));
    setError(null);
  };

  const removeCustomSlot = (id: number) => {
    if (customSlots.length <= 1) return;
    setCustomSlots(prev => prev.filter(s => s.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const seen = new Set<string>();
    const payloadSlots: { date: string; start: string; end: string }[] = [];
    const pushUnique = (slot: { date: string; start: string; end: string }) => {
      const k = `${slot.date}|${slot.start}|${slot.end}`;
      if (seen.has(k)) return;
      seen.add(k);
      payloadSlots.push(slot);
    };

    if (hasProposedOptions) {
      for (const key of selectedKeys) {
        const day = flatDayLookup.get(key);
        if (day) {
          pushUnique({ date: day.localDate, start: day.localStart, end: day.localEnd });
        }
      }
    }

    if (showCustomSlots || !hasProposedOptions) {
      for (const s of customSlots) {
        if (!s.date || !s.start || !s.end) {
          if (!hasProposedOptions || showCustomSlots) {
            setError('Please select a date, start time, and end time for each custom window.');
            return;
          }
          continue;
        }
        const startStr = s.start.format('HH:mm');
        const endStr = s.end.format('HH:mm');
        if (endStr <= startStr) {
          setError('Each time window end time must be after its start time.');
          return;
        }
        pushUnique({ date: s.date.format('YYYY-MM-DD'), start: startStr, end: endStr });
      }
    }

    if (payloadSlots.length === 0) {
      setError('Please select at least one day or option above, or suggest another time that fits your schedule.');
      return;
    }

    if (payloadSlots.length > 10) {
      setError('Please choose at most 10 availability options at once.');
      return;
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

      setSubmittedSummary(payloadSlots);
      setJustSubmitted(true);
      setStatus('submitted');
    } catch {
      setError('Network error, please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const support = meta?.support_email || 'support@learnfrenchwithnatives.com';

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#183961',
          borderRadius: 10,
          fontSize: 14,
          fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
        },
      }}
    >
      <div className="dap-page">
        <div className="dap-tricolor" aria-hidden />
        <header className="dap-topbar">
          <div className="dap-top-inner">
            <div className="dap-brand">
              <img src="/assets/Logo.png" alt="" width={38} height={38} />
              <span>
                <strong>Learn French</strong>
                <em>with Natives</em>
              </span>
            </div>
            {status === 'pending' && (
              <span className="dap-tz-pill">
                <ClockCircleOutlined /> {timezone.replace(/_/g, ' ')}
              </span>
            )}
          </div>
        </header>

        <main className="dap-wrap">
          <div className="dap-card">
            {status === 'loading' && (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <Spin size="large" />
                <p style={{ marginTop: 14, color: '#5d687d' }}>Loading your scheduling options...</p>
              </div>
            )}

            {status === 'pending' && meta && (
              <form onSubmit={handleSubmit}>
                <div className="dap-eyebrow">Demo session scheduling</div>
                <h1 className="dap-title">Hi {meta.first_name || 'there'}, choose a time that fits</h1>
                <p className="dap-sub">
                  {hasProposedOptions
                    ? 'Select one or more days or time options below. Once you submit, an instructor will contact you with your confirmed meeting link.'
                    : 'Share one or more date and time windows below. An instructor will confirm your session and email you the join link.'}
                </p>

                <div className="dap-tz-block">
                  <label htmlFor="dap-tz-select">Your timezone *</label>
                  <Select
                    id="dap-tz-select"
                    showSearch
                    style={{ width: '100%' }}
                    size="large"
                    value={timezone}
                    onChange={setTimezone}
                    options={tzOptions}
                    optionFilterProp="label"
                  />
                </div>

                {meta.admin_note && (
                  <div className="dap-note-banner">
                    <strong>Note from our team:</strong> {meta.admin_note}
                  </div>
                )}

                {hasProposedOptions ? (
                  <div className="dap-section">
                    <div className="dap-sec-head">
                      <span>Proposed times (in {timezone.replace(/_/g, ' ')})</span>
                      {selectedKeys.length > 0 && (
                        <strong className="dap-selected-count">
                          {selectedKeys.length} selected
                        </strong>
                      )}
                    </div>

                    <div className="dap-option-list" role="group" aria-label="Available demo session options">
                      {displayGroups.map((grp) => {
                        if (!grp.isRange && grp.days[0]) {
                          const opt = grp.days[0];
                          const checked = selectedKeys.includes(opt.key);
                          return (
                            <button
                              key={opt.key}
                              type="button"
                              role="checkbox"
                              aria-checked={checked}
                              className={`dap-option${checked ? ' is-selected' : ''}`}
                              onClick={() => toggleDayKey(opt.key)}
                            >
                              <span className="dap-cal-badge" aria-hidden="true">
                                <em>{opt.weekdayShort}</em>
                                <strong>{opt.dayNum}</strong>
                                <span>{opt.monthShort}</span>
                              </span>
                              <span className="dap-opt-body">
                                <strong>{opt.fullDateLabel}</strong>
                                <span className="dap-opt-time">{opt.timeLabel}</span>
                                {opt.originalLabel && (
                                  <span className="dap-opt-orig">Originally {opt.originalLabel}</span>
                                )}
                              </span>
                              <span className="dap-opt-check" aria-hidden="true">
                                {checked ? <CheckOutlined /> : null}
                              </span>
                            </button>
                          );
                        }

                        return (
                          <div key={`range-${grp.optionIndex}`} className="dap-range-card">
                            <div className="dap-range-head">
                              <div>
                                <strong>{grp.rangeTitle}</strong>
                                <span className="dap-opt-time">{grp.timeLabel} daily</span>
                                {grp.originalLabel && (
                                  <span className="dap-opt-orig">Originally {grp.originalLabel}</span>
                                )}
                              </div>
                              <span className="dap-range-hint">Select any day(s)</span>
                            </div>
                            <div className="dap-range-days">
                              {grp.days.map((day) => {
                                const checked = selectedKeys.includes(day.key);
                                return (
                                  <button
                                    key={day.key}
                                    type="button"
                                    role="checkbox"
                                    aria-checked={checked}
                                    className={`dap-day-chip${checked ? ' is-selected' : ''}`}
                                    onClick={() => toggleDayKey(day.key)}
                                  >
                                    <span className="dap-day-chip-box" aria-hidden="true">
                                      {checked ? <CheckOutlined /> : null}
                                    </span>
                                    <span>{day.chipLabel}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="dap-custom-toggle-row">
                      <Button type="link" onClick={toggleCustomMode} className="dap-custom-toggle">
                        {showCustomSlots ? 'Hide custom time windows' : 'None of these fit? Suggest another time'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="dap-window">
                    <div className="dap-window-title">Suggested window</div>
                    <div className="dap-window-grid">
                      <div className="dap-window-item">
                        <span><CalendarOutlined /> Dates</span>
                        <strong>
                          {meta.proposed_start_date === meta.proposed_end_date
                            ? meta.proposed_start_date
                            : `${meta.proposed_start_date} to ${meta.proposed_end_date}`}
                        </strong>
                      </div>
                      <div className="dap-window-item">
                        <span><ClockCircleOutlined /> Daily hours</span>
                        <strong>{meta.proposed_time_start} - {meta.proposed_time_end}</strong>
                      </div>
                      <div className="dap-window-item">
                        <span>Timezone</span>
                        <strong>{meta.proposed_timezone}</strong>
                      </div>
                    </div>
                  </div>
                )}

                {(showCustomSlots || !hasProposedOptions) && (
                  <div className="dap-custom-panel">
                    <div className="dap-sec-head" style={{ marginBottom: 10 }}>
                      <span>{hasProposedOptions ? 'Suggest your own preferred times' : 'Your preferred date & time windows *'}</span>
                      {customSlots.length < 5 && (
                        <Button type="link" size="small" icon={<PlusOutlined />} onClick={addCustomSlot} style={{ paddingInline: 0 }}>
                          Add another option
                        </Button>
                      )}
                    </div>

                    {customSlots.map((s, idx) => (
                      <div key={s.id} className="dap-slot">
                        <div className="dap-slot-field">
                          <label>Date {customSlots.length > 1 ? `#${idx + 1}` : ''}</label>
                          <DatePicker
                            style={{ width: '100%' }}
                            size="large"
                            value={s.date}
                            disabledDate={cur => cur && cur.isBefore(dayjs().startOf('day'))}
                            onChange={d => updateCustomSlot(s.id, { date: d })}
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
                            onChange={t => updateCustomSlot(s.id, { start: t })}
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
                            onChange={t => updateCustomSlot(s.id, { end: t })}
                          />
                        </div>
                        <Button
                          danger
                          type="text"
                          icon={<DeleteOutlined />}
                          disabled={customSlots.length <= 1}
                          onClick={() => removeCustomSlot(s.id)}
                          aria-label="Remove slot"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ marginTop: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#0b1733' }}>
                    Optional note
                  </label>
                  <Input.TextArea
                    rows={3}
                    maxLength={800}
                    placeholder="Anything our teaching team should know about your schedule or goals?"
                    value={note}
                    onChange={e => setNote(e.target.value)}
                  />
                </div>

                <div className="dap-once">
                  <strong>One-time link:</strong> This link expires immediately after submission so your availability cannot be altered accidentally.
                </div>

                {error && (
                  <div className="dap-error" role="alert">
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
                  {selectedKeys.length > 0 && !showCustomSlots
                    ? `Confirm ${selectedKeys.length} ${selectedKeys.length === 1 ? 'selected time' : 'selected times'}`
                    : 'Send my availability'}
                </Button>
              </form>
            )}

            {status === 'submitted' && (
              <div className="dap-state">
                <div className="dap-state-ic is-ok"><CheckCircleFilled /></div>
                <h2>{justSubmitted ? 'Availability confirmed' : 'Availability already submitted (link expired)'}</h2>
                <p>
                  {justSubmitted
                    ? 'Thank you. We received your preferred times and this single-use link is now closed. An instructor will contact you shortly with your confirmed live demo link and credentials.'
                    : 'Your availability has already been received, so this single-use link is expired and cannot be submitted again.'}
                </p>
                {justSubmitted && submittedSummary.length > 0 && (
                  <div className="dap-submitted-list">
                    <div className="dap-submitted-title">Your submitted times ({timezone.replace(/_/g, ' ')})</div>
                    {submittedSummary.map((sl, i) => (
                      <div key={i} className="dap-submitted-row">
                        <strong>{dayjs(sl.date).format('ddd, MMM D, YYYY')}</strong>
                        <span>{format12h(sl.start)} - {format12h(sl.end)}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="dap-reschedule-box">
                  <strong>Made a mistake or need to reschedule?</strong>
                  <div style={{ marginTop: 6 }}>
                    Write to <a href={`mailto:${support}`}>{support}</a> and an instructor will update your time or send a fresh link.
                  </div>
                  <Button
                    style={{ marginTop: 12 }}
                    icon={<MailOutlined />}
                    href={`mailto:${support}?subject=${encodeURIComponent('Reschedule French Demo Availability')}`}
                  >
                    Email support
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
                    ? 'A newer scheduling link was sent to your email. Please open the most recent email from Learn French with Natives, or contact us below.'
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
                    Contact support
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
