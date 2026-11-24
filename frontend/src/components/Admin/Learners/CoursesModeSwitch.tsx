// The courses' mode selector at the top of Online courses: free for everyone
// (every lesson open, with or without an account, no payment), or Paid Plans
// (Free · Standard · Premium). Takes effect on the website at once.
import { useCallback, useEffect, useState } from 'react';
import { App, Segmented, Skeleton } from 'antd';
import { CrownFilled, GiftOutlined } from '@ant-design/icons';
import { useAuth } from '../../../contexts/AuthContext';
import { call, fmtDate } from '../../Org/orgModel';

type Mode = 'free' | 'premium';
interface ModeInfo { mode: Mode; updated_at: string | null; updated_by: string | null }

export default function CoursesModeSwitch({ onModeChange }: { onModeChange?: (mode: Mode) => void }) {
  const { apiCall } = useAuth();
  const { message, modal } = App.useApp();
  const [info, setInfo] = useState<ModeInfo | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await call<ModeInfo>(apiCall, '/admin/learners/mode');
      setInfo(data);
      onModeChange?.(data.mode);
    } catch (e) {
      message.error((e as Error).message);
    }
  }, [apiCall, message, onModeChange]);
  useEffect(() => { load(); }, [load]);

  const change = (mode: Mode) => {
    if (!info || mode === info.mode) return;
    modal.confirm({
      title: mode === 'premium' ? 'Turn on Paid Plans (Free · Standard · Premium)?' : 'Make every course free for everyone?',
      icon: mode === 'premium' ? <CrownFilled style={{ color: '#b45309' }} /> : <GiftOutlined style={{ color: '#047857' }} />,
      width: 540,
      className: 'ol-modal',
      content: mode === 'premium' ? (
        <ul style={{ paddingLeft: 18, margin: '10px 0 0', display: 'grid', gap: 6 }}>
          <li><strong>Free:</strong> Visitors get A1 Module 1; signed-in free accounts get Module 1 of every path.</li>
          <li><strong>Standard:</strong> Unlocks all 464+ guided courses, practice library, dictations and certificates.</li>
          <li><strong>Premium:</strong> Unlocks all Standard courses plus Exam Simulator (TCF / TEF), CO &amp; CE past subjects, and EE &amp; EO AI credits.</li>
          <li>Monthly, Quarterly and Yearly pricing with your configured discounts go live on the learner Subscription page.</li>
          <li>Changes take effect immediately across open browser tabs.</li>
        </ul>
      ) : (
        <ul style={{ paddingLeft: 18, margin: '10px 0 0', display: 'grid', gap: 6 }}>
          <li>Every lesson, exercise, game and certificate opens to everyone, with or without an account.</li>
          <li>Online payment closes and the 3-tier pricing page switches to Free mode notice.</li>
          <li>Subscriptions already running keep renewing on Paystack. Stop them in Paystack if you do not want those people to be charged while everything is free.</li>
        </ul>
      ),
      okText: mode === 'premium' ? 'Enable Paid Plans' : 'Make everything free',
      onOk: async () => {
        setBusy(true);
        try {
          const next = await call<ModeInfo>(apiCall, '/admin/learners/mode', 'PUT', { mode });
          setInfo(next);
          onModeChange?.(next.mode);
          message.success(mode === 'premium' ? 'Paid plans enabled (Free · Standard · Premium)' : 'Every course is free for everyone');
        } catch (e) { message.error((e as Error).message); } finally { setBusy(false); }
      },
    });
  };

  if (!info) return <Skeleton.Input active style={{ width: '100%', height: 72, borderRadius: 16 }} />;
  const free = info.mode === 'free';
  return (
    <section className={`ol-mode-banner ${free ? 'is-free' : 'is-premium'}`} aria-label="Website courses access mode">
      <div className="ol-mode-left">
        <span className="ol-mode-ic" aria-hidden>{free ? <GiftOutlined /> : <CrownFilled />}</span>
        <div className="ol-mode-copy">
          <div className="ol-mode-head">
            <strong>Website courses mode</strong>
            <span className="ol-mode-pill">
              <i aria-hidden />
              {free ? 'Free for everyone' : 'Free · Standard · Premium'}
            </span>
          </div>
          <p className="ol-mode-desc">
            {free
              ? 'Every lesson is open to everyone, with or without an account. No payment.'
              : 'Free: Module 1 starters · Standard: all courses · Premium: courses + Exam Simulator & AI credits.'}
            {info.updated_at && (
              <span className="ol-mode-changed">
                {' '}· Changed {fmtDate(info.updated_at, 'en-CA')}{info.updated_by ? ` by ${info.updated_by}` : ''}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="ol-mode-switch-wrap">
        <Segmented
          value={info.mode}
          disabled={busy}
          onChange={v => change(v as Mode)}
          options={[
            { label: 'Free for everyone', value: 'free', icon: <GiftOutlined /> },
            { label: 'Paid Plans (Standard & Premium)', value: 'premium', icon: <CrownFilled /> },
          ]}
        />
      </div>
    </section>
  );
}
