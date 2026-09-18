import React, { useEffect, useRef, useState } from 'react';
import { Button, Input, Modal } from 'antd';
import type { InputRef } from 'antd';
import { useNavigate } from 'react-router-dom';
import { Ic, formatMeetingIdInput, passcodeFromLink } from './meetingUi';
import './MeetingAccess.css';

/* ══════════════════════════════════════════
   JOIN WITH A MEETING ID — like Teams / Meet.
   Checks the ID and passcode with the server before opening the class, so
   mistakes are explained right here instead of on a blank page.
══════════════════════════════════════════ */

interface Props {
  open: boolean;
  onClose: () => void;
  apiCall: (endpoint: string, options?: RequestInit) => Promise<Response>;
}

const PASS_LEN = 6;
const cleanPass = (v: string) => v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, PASS_LEN);
const idReady = (v: string) => /^[a-z]{3}-[a-z]{4}-[a-z]{3}$/.test(v) || (/\d/.test(v) && v.length > 10);

const JoinWithId: React.FC<Props> = ({ open, onClose, apiCall }) => {
  const navigate = useNavigate();
  const [meetingId, setMeetingId] = useState('');
  const [passcode, setPasscode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ field: 'id' | 'pass' | 'form'; text: string } | null>(null);
  const idRef = useRef<InputRef>(null);

  useEffect(() => {
    if (!open) return;
    setMeetingId(''); setPasscode(''); setError(null); setBusy(false);
    const t = window.setTimeout(() => idRef.current?.focus(), 120);
    return () => window.clearTimeout(t);
  }, [open]);

  const onIdChange = (raw: string) => {
    const pass = passcodeFromLink(raw);
    if (pass) setPasscode(cleanPass(pass));
    setMeetingId(formatMeetingIdInput(raw));
    if (error?.field !== 'pass') setError(null);
  };

  const submit = async () => {
    if (!idReady(meetingId) || busy) return;
    setBusy(true);
    setError(null);
    try {
      const resp = await apiCall('/meetings/verify', { method: 'POST', body: JSON.stringify({ meetingId, passcode }) });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        const text = data.error || 'This meeting could not be opened.';
        setError({ field: data.code === 'NOT_FOUND' ? 'id' : data.code === 'BAD_PASSCODE' ? 'pass' : 'form', text });
        return;
      }
      onClose();
      navigate(`/app/meeting/${data.code}`, { state: { passcode: data.direct ? undefined : passcode, verified: !data.direct } });
    } catch {
      setError({ field: 'form', text: 'No connection. Check your internet and try again.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onCancel={onClose} footer={null} width={460} centered className="ma-modal" destroyOnHidden>
      <form className="ma ma-join" onSubmit={e => { e.preventDefault(); submit(); }}>
        <header className="ma-head">
          <span className="ma-head-ic">{Ic.hash}</span>
          <div className="ma-head-text">
            <span className="ma-over">Live class</span>
            <h3>Join with a meeting ID</h3>
            <p>Use the ID and passcode from your invitation.</p>
          </div>
        </header>

        <div className="ma-body">
          <label className="ma-field">
            <span className="ma-field-label">Meeting ID</span>
            <Input
              ref={idRef}
              size="large"
              className="ma-id-input"
              placeholder="abc-defg-hij"
              value={meetingId}
              onChange={e => onIdChange(e.target.value)}
              status={error?.field === 'id' ? 'error' : undefined}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              inputMode="text"
              aria-describedby="ma-id-help"
            />
            <span id="ma-id-help" className={`ma-help${error?.field === 'id' ? ' is-error' : ''}`}>
              {error?.field === 'id' ? error.text : 'You can also paste the whole invitation link.'}
            </span>
          </label>

          <div className="ma-field">
            <span className="ma-field-label" id="ma-pass-label">Passcode</span>
            <div className="ma-otp" onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); submit(); } }}>
              <Input.OTP
                length={PASS_LEN}
                size="large"
                value={passcode}
                formatter={cleanPass}
                onChange={v => { setPasscode(cleanPass(v)); if (error?.field === 'pass') setError(null); }}
                status={error?.field === 'pass' ? 'error' : undefined}
                aria-labelledby="ma-pass-label"
              />
            </div>
            <span className={`ma-help${error?.field === 'pass' ? ' is-error' : ''}`}>
              {error?.field === 'pass' ? error.text : 'Not needed for your own classes. Letters are not case-sensitive.'}
            </span>
          </div>

          {error?.field === 'form' && <div className="ma-alert" role="alert">{Ic.info}<span>{error.text}</span></div>}

          <div className="ma-note">
            <span>{Ic.door}</span>
            <p>If you are not in the class’s batch, you wait in the lobby until the host lets you in.</p>
          </div>
        </div>

        <footer className="ma-foot">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={busy} disabled={!idReady(meetingId)}>Continue</Button>
        </footer>
      </form>
    </Modal>
  );
};

export default JoinWithId;
