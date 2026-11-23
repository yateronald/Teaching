// The courses' mode, at the top of the Online courses page: free for everyone
// (every lesson open, with or without an account, no payment), or the Premium
// levels (visitor / free account / Premium). Takes effect on the website at
// once, without a new build.
import { useCallback, useEffect, useState } from 'react';
import { App, Segmented, Skeleton, Tag } from 'antd';
import { CrownFilled, GiftOutlined } from '@ant-design/icons';
import { useAuth } from '../../../contexts/AuthContext';
import { call, fmtDate } from '../../Org/orgModel';

type Mode = 'free' | 'premium';
interface ModeInfo { mode: Mode; updated_at: string | null; updated_by: string | null }

export default function CoursesModeSwitch() {
  const { apiCall } = useAuth();
  const { message, modal } = App.useApp();
  const [info, setInfo] = useState<ModeInfo | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try { setInfo(await call<ModeInfo>(apiCall, '/admin/learners/mode')); } catch (e) { message.error((e as Error).message); }
  }, [apiCall, message]);
  useEffect(() => { load(); }, [load]);

  const change = (mode: Mode) => {
    if (!info || mode === info.mode) return;
    modal.confirm({
      title: mode === 'premium' ? 'Turn on Premium?' : 'Make every course free for everyone?',
      icon: mode === 'premium' ? <CrownFilled style={{ color: '#b7791f' }} /> : <GiftOutlined style={{ color: '#067a4f' }} />,
      width: 520,
      content: mode === 'premium' ? (
        <ul style={{ paddingLeft: 18, margin: '8px 0 0' }}>
          <li>Without an account: only the first module of the A1 path.</li>
          <li>With a free account: the first module of every path.</li>
          <li>Everything else (lessons, practice library, games, certificates) needs Premium.</li>
          <li>Online payment opens, if Paystack is configured and a price is on sale.</li>
          <li>Changes take effect immediately across open browser tabs (active free users and visitors are automatically blocked from Premium content).</li>
        </ul>
      ) : (
        <ul style={{ paddingLeft: 18, margin: '8px 0 0' }}>
          <li>Every lesson, exercise, game and certificate opens to everyone, with or without an account.</li>
          <li>Online payment closes: no new purchase is possible.</li>
          <li>Subscriptions already running keep renewing on Paystack. Stop them in Paystack if you do not want those people to be charged while everything is free.</li>
        </ul>
      ),
      okText: mode === 'premium' ? 'Turn on Premium' : 'Make everything free',
      onOk: async () => {
        setBusy(true);
        try {
          setInfo(await call<ModeInfo>(apiCall, '/admin/learners/mode', 'PUT', { mode }));
          message.success(mode === 'premium' ? 'Premium is on' : 'Every course is free for everyone');
        } catch (e) { message.error((e as Error).message); } finally { setBusy(false); }
      },
    });
  };

  if (!info) return <Skeleton.Input active style={{ width: 360 }} />;
  const free = info.mode === 'free';
  return (
    <section style={{
      display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16, padding: '14px 16px',
      border: `1px solid ${free ? '#a7f3d0' : '#f0d48a'}`, borderRadius: 12, background: free ? '#ecfdf5' : '#fffbeb',
    }}>
      <div>
        <strong>Website courses: </strong>
        {free ? <Tag color="green">Free for everyone</Tag> : <Tag color="gold" icon={<CrownFilled />}>Free + Premium</Tag>}
        <div style={{ color: '#475569', fontSize: 13, marginTop: 4 }}>
          {free ? 'Every lesson is open to everyone, with or without an account. No payment.' : 'Visitors: A1 first module. Free accounts: first module of every path. Premium: everything.'}
          {info.updated_at && ` · Changed ${fmtDate(info.updated_at, 'en-CA')}${info.updated_by ? ` by ${info.updated_by}` : ''}`}
        </div>
      </div>
      <Segmented
        value={info.mode}
        disabled={busy}
        onChange={v => change(v as Mode)}
        options={[{ label: 'Free for everyone', value: 'free', icon: <GiftOutlined /> }, { label: 'Free + Premium', value: 'premium', icon: <CrownFilled /> }]}
      />
    </section>
  );
}
