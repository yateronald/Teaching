import React, { useEffect, useState } from 'react';
import { App, Button, Modal, Tooltip } from 'antd';
import { Ic, copyText, invitationText, meetingLink } from './meetingUi';
import './MeetingAccess.css';

/* ══════════════════════════════════════════
   MEETING DETAILS — ID, passcode, link, invitation.
   The host sees and manages the passcode; everyone else only the meeting ID.
══════════════════════════════════════════ */

export interface ShareableMeeting {
  id: number;
  code: string;
  title: string;
  passcode?: string | null;
  batch_name?: string | null;
  hostName?: string;
  when?: string;
}

interface Props {
  open: boolean;
  meeting: ShareableMeeting | null;
  isHost: boolean;
  /** Just created: celebrate and lead with the invitation. */
  created?: boolean;
  onClose: () => void;
  apiCall?: (endpoint: string, options?: RequestInit) => Promise<Response>;
  onPasscodeChange?: (passcode: string) => void;
}

const MeetingShare: React.FC<Props> = ({ open, meeting, isHost, created, onClose, apiCall, onPasscodeChange }) => {
  const { message, modal } = App.useApp();
  const [reveal, setReveal] = useState(false);
  const [passcode, setPasscode] = useState<string | null>(meeting?.passcode ?? null);
  const [copied, setCopied] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  useEffect(() => { setPasscode(meeting?.passcode ?? null); setReveal(!!created); }, [meeting?.id, meeting?.passcode, created]);
  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(null), 1800);
    return () => window.clearTimeout(t);
  }, [copied]);

  if (!meeting) return null;
  const showPass = isHost && !!passcode;
  const link = meetingLink(meeting.code, showPass ? passcode : null);

  const copy = async (key: string, text: string, what: string) => {
    if (await copyText(text)) { setCopied(key); message.success(`${what} copied`); }
    else message.info(text);
  };

  const invitation = () => invitationText({
    title: meeting.title,
    code: meeting.code,
    passcode: showPass ? passcode : null,
    hostName: meeting.hostName,
    when: meeting.when,
    batchName: meeting.batch_name,
  });

  const resetPasscode = () => {
    if (!apiCall) return;
    modal.confirm({
      title: 'Create a new passcode?',
      content: 'The current passcode stops working immediately. People already admitted keep their access; anyone new will need the new passcode.',
      okText: 'Create new passcode',
      centered: true,
      onOk: async () => {
        setResetting(true);
        try {
          const resp = await apiCall(`/meetings/${meeting.id}/passcode`, { method: 'POST' });
          if (!resp.ok) throw new Error();
          const d = await resp.json();
          setPasscode(d.passcode);
          setReveal(true);
          onPasscodeChange?.(d.passcode);
          message.success('New passcode ready — share it with your invitees');
        } catch {
          message.error('The passcode could not be changed. Try again.');
        } finally {
          setResetting(false);
        }
      },
    });
  };

  const mail = `mailto:?subject=${encodeURIComponent(`Live class: ${meeting.title}`)}&body=${encodeURIComponent(invitation())}`;

  return (
    <Modal open={open} onCancel={onClose} footer={null} width={560} centered className="ma-modal" destroyOnHidden>
      <div className="ma">
        <header className={`ma-head${created ? ' is-created' : ''}`}>
          <span className="ma-head-ic">{created ? Ic.check : Ic.link}</span>
          <div className="ma-head-text">
            <span className="ma-over">{created ? 'Meeting created' : isHost ? 'Share & access' : 'Meeting details'}</span>
            <h3>{meeting.title}</h3>
            {meeting.when && <p>{meeting.when}</p>}
          </div>
        </header>

        <div className="ma-body">
          <div className={`ma-creds${showPass ? '' : ' is-single'}`}>
            <div className="ma-cred">
              <span className="ma-cred-label">{Ic.hash} Meeting ID</span>
              <div className="ma-cred-row">
                <code className="ma-code" aria-label={`Meeting ID ${meeting.code.split('').join(' ')}`}>{meeting.code}</code>
                <Tooltip title="Copy meeting ID">
                  <button type="button" className={`ma-icon${copied === 'id' ? ' is-done' : ''}`} onClick={() => copy('id', meeting.code, 'Meeting ID')} aria-label="Copy meeting ID">
                    {copied === 'id' ? Ic.check : Ic.copy}
                  </button>
                </Tooltip>
              </div>
            </div>
            {showPass && (
              <div className="ma-cred">
                <span className="ma-cred-label">{Ic.key} Passcode</span>
                <div className="ma-cred-row">
                  <code className={`ma-code is-pass${reveal ? '' : ' is-hidden'}`} aria-label={reveal ? `Passcode ${passcode!.split('').join(' ')}` : 'Passcode hidden'}>
                    {reveal ? passcode : '••••••'}
                  </code>
                  <Tooltip title={reveal ? 'Hide' : 'Show'}>
                    <button type="button" className="ma-icon" onClick={() => setReveal(v => !v)} aria-label={reveal ? 'Hide passcode' : 'Show passcode'}>
                      {reveal ? Ic.eyeOff : Ic.eye}
                    </button>
                  </Tooltip>
                  <Tooltip title="Copy passcode">
                    <button type="button" className={`ma-icon${copied === 'pass' ? ' is-done' : ''}`} onClick={() => copy('pass', passcode!, 'Passcode')} aria-label="Copy passcode">
                      {copied === 'pass' ? Ic.check : Ic.copy}
                    </button>
                  </Tooltip>
                </div>
                {apiCall && (
                  <button type="button" className="ma-link" onClick={resetPasscode} disabled={resetting}>
                    {Ic.refresh} {resetting ? 'Creating…' : 'New passcode'}
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="ma-url">
            <span className="ma-url-ic">{Ic.link}</span>
            <span className="ma-url-text" title={reveal ? link : undefined}>
              {link.replace(/^https?:\/\//, '').replace(/pwd=.*$/, reveal ? '$&' : 'pwd=••••••')}
            </span>
            <Button size="small" onClick={() => copy('link', link, 'Link')}>{copied === 'link' ? 'Copied' : 'Copy link'}</Button>
          </div>
          {showPass && <p className="ma-fine">The link carries the passcode, so people you send it to only need to sign in and ask to join.</p>}

          {isHost && (
            <div className="ma-actions">
              <Button type="primary" size="large" icon={<span className="anticon">{Ic.copy}</span>} onClick={() => copy('invite', invitation(), 'Invitation')}>
                {copied === 'invite' ? 'Invitation copied' : 'Copy invitation'}
              </Button>
              <Button size="large" icon={<span className="anticon">{Ic.mail}</span>} href={mail}>Email it</Button>
            </div>
          )}

          <ul className="ma-rules" aria-label="Who can join">
            <li>
              <span className="ma-rule-ic is-green">{Ic.people}</span>
              <div>
                <strong>{meeting.batch_name ? `Students of ${meeting.batch_name}` : 'Your batch'}</strong>
                <span>Join directly from their Live meetings page — no passcode needed.</span>
              </div>
            </li>
            <li>
              <span className="ma-rule-ic is-amber">{Ic.door}</span>
              <div>
                <strong>Other students and teachers</strong>
                <span>Sign in, enter the meeting ID and passcode, then wait in the lobby until {isHost ? 'you let them in' : 'the host lets them in'}.</span>
              </div>
            </li>
            <li>
              <span className="ma-rule-ic is-blue">{Ic.shield}</span>
              <div>
                <strong>{isHost ? 'You stay in control' : 'Protected class'}</strong>
                <span>{isHost ? 'Admit or deny each request, lock the class, remove someone or change the passcode at any time.' : 'Only people the host admits can see and hear the class.'}</span>
              </div>
            </li>
          </ul>
        </div>

        <footer className="ma-foot">
          <Button onClick={onClose}>{created ? 'Done' : 'Close'}</Button>
        </footer>
      </div>
    </Modal>
  );
};

export default MeetingShare;
