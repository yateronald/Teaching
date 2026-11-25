import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, ConfigProvider, Input, Segmented } from 'antd';
import {
  KeyOutlined, LinkOutlined, LockOutlined, MailOutlined, SafetyCertificateOutlined, UserOutlined, VideoCameraOutlined,
} from '@ant-design/icons';
import { formatMeetingIdInput, passcodeFromLink } from './meetingUi';
import './PublicMeetingEntry.css';

const API_BASE = ((import.meta.env.VITE_API_BASE_URL as string | undefined) || 'https://api.learnfrenchwithnatives.com/api').replace(/\/$/, '');

const cleanPass = (v: string) => v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);

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

  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'Join a Meeting — Learn French with Natives';
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => {
      document.title = prevTitle;
      meta.remove();
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
      setError(mode === 'link' ? 'Please paste your meeting link.' : 'Please enter your Meeting ID.');
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
          setError('This link did not include a passcode. Enter the 6-character passcode below or switch to Meeting ID & Passcode.');
        } else {
          setError(data.error || 'Could not verify this meeting. Check your link, ID and passcode.');
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
      setError('Network error — please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#047857', borderRadius: 10, fontSize: 14 } }}>
      <div className="pme-page">
        <header className="pme-topbar">
          <div className="pme-brand">
            <img src="/assets/Logo.png" alt="Learn French with Natives" />
            <span className="pme-brand-name">Learn French with Natives</span>
          </div>
          <span className="pme-brand-tag"><LockOutlined /> Encrypted Live Room</span>
        </header>

        <main className="pme-main">
          <section className="pme-copy">
            <h1>Join your live French meeting in seconds.</h1>
            <p>
              Enter your invitation link or Meeting ID and passcode. No student account required — check your camera and microphone before entering the room.
            </p>
            <div className="pme-pillars">
              <div className="pme-pillar">
                <span className="pme-pillar-ic"><VideoCameraOutlined /></span>
                <div>
                  <strong>HD Video &amp; Clear Audio</strong>
                  <span>Test your microphone, speakers, and camera on the pre-join screen before you appear live.</span>
                </div>
              </div>
              <div className="pme-pillar">
                <span className="pme-pillar-ic"><SafetyCertificateOutlined /></span>
                <div>
                  <strong>Host-Controlled Waiting Room</strong>
                  <span>If the meeting has not started yet or requires approval, we automatically keep your place until the host begins.</span>
                </div>
              </div>
            </div>
          </section>

          <section className="pme-card" aria-label="Join a meeting">
            <div className="pme-card-head">
              <h2>Enter meeting details</h2>
              <p>Use either your invitation link or the Meeting ID &amp; passcode.</p>
            </div>

            <div className="pme-mode">
              <Segmented
                block
                value={mode}
                onChange={v => { setMode(v as 'code' | 'link'); setError(null); }}
                options={[
                  { value: 'code', label: 'ID & Passcode' },
                  { value: 'link', label: 'Meeting Link' },
                ]}
              />
            </div>

            <form onSubmit={handleJoin}>
              <div className="pme-field">
                <label htmlFor="pme-name">Your name *</label>
                <Input
                  id="pme-name"
                  size="large"
                  prefix={<UserOutlined />}
                  placeholder="Full name shown in the meeting"
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
                      <label htmlFor="pme-link-pass">Passcode (if not included in link)</label>
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
                <>
                  <div className="pme-field">
                    <label htmlFor="pme-code">Meeting ID *</label>
                    <Input
                      id="pme-code"
                      size="large"
                      prefix={<span style={{ fontWeight: 700, color: '#64748b' }}>#</span>}
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
                      placeholder="6-character passcode"
                      maxLength={6}
                      value={passcodeInput}
                      onChange={e => { setPasscodeInput(cleanPass(e.target.value)); setError(null); }}
                    />
                  </div>
                </>
              )}

              {error && <div className="pme-error" role="alert">{error}</div>}

              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                icon={<VideoCameraOutlined />}
                style={{ height: 48, fontWeight: 600 }}
              >
                Continue to pre-join
              </Button>
            </form>
          </section>
        </main>

        <footer className="pme-footer">
          © {new Date().getFullYear()} Learn French with Natives · Live Meeting Portal
        </footer>
      </div>
    </ConfigProvider>
  );
};

export default PublicMeetingEntry;
