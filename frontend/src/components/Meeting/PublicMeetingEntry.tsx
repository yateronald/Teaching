import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, ConfigProvider, Input } from 'antd';
import { ArrowRightOutlined, KeyOutlined, LinkOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { formatMeetingIdInput, passcodeFromLink } from './meetingUi';
import './PublicMeetingEntry.css';

const API_BASE = ((import.meta.env.VITE_API_BASE_URL as string | undefined) || 'https://api.learnfrenchwithnatives.com/api').replace(/\/$/, '');

const cleanPass = (v: string) => v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);

const formatLocalClock = () => {
  try {
    const now = new Date();
    const time = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(now);
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone?.replace(/_/g, ' ') || '';
    return tz ? `${time} · ${tz}` : time;
  } catch {
    return '';
  }
};

const PublicMeetingEntry: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'code' | 'link'>('code');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [linkInput, setLinkInput] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [passcodeInput, setPasscodeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clockText, setClockText] = useState(formatLocalClock);

  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'Join a Meeting | Learn French with Natives';
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    const timer = window.setInterval(() => setClockText(formatLocalClock()), 30000);
    return () => {
      document.title = prevTitle;
      meta.remove();
      window.clearInterval(timer);
    };
  }, []);

  const handleLinkChange = (val: string) => {
    setLinkInput(val);
    setError(null);
    const extractedPass = passcodeFromLink(val);
    if (extractedPass) setPasscodeInput(extractedPass);
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleanName = name.trim();
    if (cleanName.length < 2) {
      setError('Please enter your name (at least 2 characters).');
      return;
    }

    const rawRef = mode === 'link' ? linkInput.trim() : codeInput.trim();
    const extractedPass = mode === 'link' ? (passcodeFromLink(linkInput) || passcodeInput) : passcodeInput;
    if (!rawRef) {
      setError(mode === 'link' ? 'Please paste your invitation link.' : 'Please enter your Meeting ID.');
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/public/meetings/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: rawRef,
          passcode: cleanPass(extractedPass),
        }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        if (resp.status === 403 && data.code === 'PASSCODE_REQUIRED' && mode === 'link') {
          setError('This link did not include a passcode. Enter the 6-character passcode below or switch to ID & Passcode.');
        } else {
          setError(data.error || 'Could not verify this meeting. Check your link, Meeting ID and passcode.');
        }
        return;
      }

      navigate(`/meeting/${data.code}`, {
        state: {
          displayName: cleanName,
          email: email.trim() || undefined,
          passcode: cleanPass(extractedPass),
          verified: true,
        },
      });
    } catch {
      setError('Unable to reach the server. Check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

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
      <div className="pme-page">
        <div className="pme-tricolor" aria-hidden />
        <header className="pme-topbar">
          <div className="pme-top-inner">
            <div className="pme-brand">
              <img src="/assets/Logo.png" alt="" width={38} height={38} />
              <span>
                <strong>Learn French</strong>
                <em>with Natives</em>
              </span>
            </div>
            {clockText && <span className="pme-clock">{clockText}</span>}
          </div>
        </header>

        <main className="pme-main">
          <section className="pme-copy">
            <span className="pme-eyebrow">Live classroom</span>
            <h1>Join your live session.</h1>
            <p className="pme-lead">
              Enter the invitation link or the Meeting ID and passcode from your confirmation email. No student account is needed.
            </p>

            <ol className="pme-steps">
              <li>
                <span className="pme-step-num">01</span>
                <div>
                  <strong>Verify your invitation</strong>
                  <span>Enter the 10-letter Meeting ID (like <code>abc-defg-hij</code>) and 6-character passcode, or paste the direct link.</span>
                </div>
              </li>
              <li>
                <span className="pme-step-num">02</span>
                <div>
                  <strong>Check camera and microphone</strong>
                  <span>Test your video and sound privately before appearing live in front of your teacher.</span>
                </div>
              </li>
              <li>
                <span className="pme-step-num">03</span>
                <div>
                  <strong>Enter automatically or wait for host</strong>
                  <span>If the session has not started yet or requires approval, keeping the tab open lets you in as soon as the host begins.</span>
                </div>
              </li>
            </ol>
          </section>

          <section className="pme-card" aria-label="Join a meeting">
            <div className="pme-card-head">
              <h2>Meeting sign-in</h2>
              <p>Use your invitation credentials to open the camera check.</p>
            </div>

            <div className="pme-tabs" role="tablist" aria-label="Join method">
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'code'}
                className={mode === 'code' ? 'is-active' : ''}
                onClick={() => { setMode('code'); setError(null); }}
              >
                ID &amp; Passcode
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'link'}
                className={mode === 'link' ? 'is-active' : ''}
                onClick={() => { setMode('link'); setError(null); }}
              >
                Invitation Link
              </button>
            </div>

            <form onSubmit={handleJoin}>
              <div className="pme-field">
                <label htmlFor="pme-name">Your name *</label>
                <Input
                  id="pme-name"
                  size="large"
                  prefix={<UserOutlined />}
                  placeholder="Full name shown to the host"
                  maxLength={80}
                  value={name}
                  onChange={e => { setName(e.target.value); setError(null); }}
                />
              </div>

              <div className="pme-field">
                <label htmlFor="pme-email">Email (optional)</label>
                <Input
                  id="pme-email"
                  size="large"
                  type="email"
                  prefix={<MailOutlined />}
                  placeholder="you@example.com"
                  maxLength={180}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>

              {mode === 'link' ? (
                <>
                  <div className="pme-field">
                    <label htmlFor="pme-link">Meeting link *</label>
                    <Input
                      id="pme-link"
                      size="large"
                      prefix={<LinkOutlined />}
                      placeholder="https://www.learnfrenchwithnatives.com/meeting/abc-defg-hij#pwd=..."
                      value={linkInput}
                      onChange={e => handleLinkChange(e.target.value)}
                    />
                  </div>
                  {!passcodeFromLink(linkInput) && (
                    <div className="pme-field">
                      <label htmlFor="pme-link-pass">Passcode (if omitted from link)</label>
                      <Input
                        id="pme-link-pass"
                        size="large"
                        prefix={<KeyOutlined />}
                        placeholder="e.g. K7M2QX"
                        maxLength={6}
                        value={passcodeInput}
                        onChange={e => { setPasscodeInput(cleanPass(e.target.value)); setError(null); }}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="pme-split">
                  <div className="pme-field">
                    <label htmlFor="pme-code">Meeting ID *</label>
                    <Input
                      id="pme-code"
                      size="large"
                      prefix={<span className="pme-hash">#</span>}
                      placeholder="abc-defg-hij"
                      value={codeInput}
                      onChange={e => { setCodeInput(formatMeetingIdInput(e.target.value)); setError(null); }}
                    />
                  </div>
                  <div className="pme-field">
                    <label htmlFor="pme-pass">Passcode *</label>
                    <Input
                      id="pme-pass"
                      size="large"
                      prefix={<KeyOutlined />}
                      placeholder="K7M2QX"
                      maxLength={6}
                      value={passcodeInput}
                      onChange={e => { setPasscodeInput(cleanPass(e.target.value)); setError(null); }}
                    />
                  </div>
                </div>
              )}

              {error && <div className="pme-error" role="alert">{error}</div>}

              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                className="pme-submit"
              >
                <span>Continue to camera check</span>
                <ArrowRightOutlined />
              </Button>
            </form>
          </section>
        </main>

        <footer className="pme-footer">
          <span>Learn French with Natives</span>
          <span aria-hidden>·</span>
          <a href="mailto:support@learnfrenchwithnatives.com">support@learnfrenchwithnatives.com</a>
        </footer>
      </div>
    </ConfigProvider>
  );
};

export default PublicMeetingEntry;
