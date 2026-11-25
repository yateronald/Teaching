import React, { useEffect, useState } from 'react';
import { App, Button, Input, Modal, Switch, Tag, Tooltip } from 'antd';
import { Ic, copyText, invitationText, meetingLink } from './meetingUi';
import './MeetingAccess.css';

/* ══════════════════════════════════════════
   MEETING DETAILS — ID, passcode, link, invitation, external invitees & approval toggle.
   ══════════════════════════════════════════ */

export interface ShareableInvitee {
  email: string;
  name?: string | null;
  notified_at?: string | null;
}

export interface ShareableMeeting {
  id: number;
  code: string;
  title: string;
  passcode?: string | null;
  batch_name?: string | null;
  hostName?: string;
  when?: string;
  is_public?: boolean;
  require_approval?: boolean;
  invitees?: ShareableInvitee[];
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
  onSettingsUpdated?: (patch: { require_approval?: boolean; invitees?: ShareableInvitee[] }) => void;
}

const MeetingShare: React.FC<Props> = ({
  open,
  meeting,
  isHost,
  created,
  onClose,
  apiCall,
  onPasscodeChange,
  onSettingsUpdated,
}) => {
  const { message, modal } = App.useApp();
  const [reveal, setReveal] = useState(false);
  const [passcode, setPasscode] = useState<string | null>(meeting?.passcode ?? null);
  const [copied, setCopied] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const [requireApproval, setRequireApproval] = useState(meeting?.require_approval !== false);
  const [invitees, setInvitees] = useState<ShareableInvitee[]>(meeting?.invitees || []);
  const [newEmails, setNewEmails] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    setPasscode(meeting?.passcode ?? null);
    setReveal(!!created);
    setRequireApproval(meeting?.require_approval !== false);
    setInvitees(meeting?.invitees || []);
  }, [meeting?.id, meeting?.passcode, meeting?.require_approval, meeting?.invitees, created]);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(null), 1800);
    return () => window.clearTimeout(t);
  }, [copied]);

  if (!meeting) return null;
  const isPublic = !!meeting.is_public;
  const showPass = isHost && !!passcode;
  const link = meetingLink(meeting.code, showPass ? passcode : null, isPublic);

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
    isPublic,
    requireApproval,
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

  const toggleApproval = async (nextVal: boolean) => {
    if (!apiCall) return;
    setSavingSettings(true);
    try {
      const resp = await apiCall(`/meetings/${meeting.id}/settings`, {
        method: 'PATCH',
        body: JSON.stringify({ require_approval: nextVal }),
      });
      if (!resp.ok) throw new Error();
      setRequireApproval(nextVal);
      onSettingsUpdated?.({ require_approval: nextVal });
      message.success(nextVal ? 'Host approval enabled before guests enter' : 'Anyone with the link or credentials can join directly');
    } catch {
      message.error('Could not update joining policy');
    } finally {
      setSavingSettings(false);
    }
  };

  const sendMoreInvites = async () => {
    if (!apiCall || !newEmails.trim()) return;
    setSavingSettings(true);
    try {
      const resp = await apiCall(`/meetings/${meeting.id}/settings`, {
        method: 'PATCH',
        body: JSON.stringify({ invitee_emails: newEmails }),
      });
      if (!resp.ok) throw new Error();
      const d = await resp.json();
      setInvitees(d.invitees || []);
      setNewEmails('');
      onSettingsUpdated?.({ invitees: d.invitees || [] });
      message.success(d.newly_invited > 0 ? `Sent meeting email to ${d.newly_invited} invitee(s)` : 'No new valid emails to invite');
    } catch {
      message.error('Could not send invitations');
    } finally {
      setSavingSettings(false);
    }
  };

  const mail = `mailto:?subject=${encodeURIComponent(`Meeting invitation: ${meeting.title}`)}&body=${encodeURIComponent(invitation())}`;

  return (
    <Modal open={open} onCancel={onClose} footer={null} width={580} centered className="ma-modal" destroyOnHidden>
      <div className="ma">
        <header className={`ma-head${created ? ' is-created' : ''}`}>
          <span className="ma-head-ic">{created ? Ic.check : Ic.link}</span>
          <div className="ma-head-text">
            <span className="ma-over">
              {created ? 'Meeting created' : isHost ? 'Share & access' : 'Meeting details'}
              {isPublic && <Tag color="blue" style={{ marginLeft: 8, fontSize: 11 }}>Public link enabled</Tag>}
            </span>
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
          {showPass && (
            <p className="ma-fine">
              {isPublic
                ? 'Public link carries the passcode so external participants can join directly at /meeting without a portal account.'
                : 'The link carries the passcode, so people you send it to only need to sign in and ask to join.'}
            </p>
          )}

          {isHost && (
            <div className="ma-actions">
              <Button type="primary" size="large" icon={<span className="anticon">{Ic.copy}</span>} onClick={() => copy('invite', invitation(), 'Invitation')}>
                {copied === 'invite' ? 'Invitation copied' : 'Copy invitation'}
              </Button>
              <Button size="large" icon={<span className="anticon">{Ic.mail}</span>} href={mail}>Email it</Button>
            </div>
          )}

          {isHost && isPublic && apiCall && (
            <div style={{ marginTop: 14, padding: '12px 14px', borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <div>
                  <strong style={{ fontSize: 13, display: 'block', color: '#0f172a' }}>Require host approval before joining</strong>
                  <span style={{ fontSize: 12, color: '#64748b' }}>
                    {requireApproval ? 'Guests wait in the lobby until admitted.' : 'Anyone with the link or ID & passcode enters straight away once live.'}
                  </span>
                </div>
                <Switch checked={requireApproval} loading={savingSettings} onChange={toggleApproval} />
              </div>

              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #e2e8f0' }}>
                <strong style={{ fontSize: 12.5, color: '#0f172a', display: 'block', marginBottom: 6 }}>
                  Email invitations ({invitees.length})
                </strong>
                {invitees.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                    {invitees.map(inv => (
                      <Tag key={inv.email} color="geekblue" style={{ margin: 0 }}>{inv.email}</Tag>
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8 }}>
                  <Input
                    size="small"
                    placeholder="Add emails separated by comma…"
                    value={newEmails}
                    onChange={e => setNewEmails(e.target.value)}
                    onPressEnter={sendMoreInvites}
                  />
                  <Button size="small" type="primary" loading={savingSettings} disabled={!newEmails.trim()} onClick={sendMoreInvites}>
                    Send email
                  </Button>
                </div>
              </div>
            </div>
          )}

          <ul className="ma-rules" aria-label="Who can join">
            {isPublic ? (
              <li>
                <span className="ma-rule-ic is-green">{Ic.people}</span>
                <div>
                  <strong>External guests &amp; invitees</strong>
                  <span>
                    {requireApproval
                      ? 'Open the public meeting link (or enter Meeting ID + passcode at /meeting) and wait in the lobby for admission.'
                      : 'Open the public meeting link (or enter Meeting ID + passcode at /meeting) to join immediately once started.'}
                  </span>
                </div>
              </li>
            ) : (
              <li>
                <span className="ma-rule-ic is-green">{Ic.people}</span>
                <div>
                  <strong>{meeting.batch_name ? `Students of ${meeting.batch_name}` : 'Your batch'}</strong>
                  <span>Join directly from their Live meetings page — no passcode needed.</span>
                </div>
              </li>
            )}
            <li>
              <span className="ma-rule-ic is-blue">{Ic.shield}</span>
              <div>
                <strong>{isHost ? 'You stay in control' : 'Protected meeting'}</strong>
                <span>{isHost ? 'Admit or deny requests, lock the room, remove participants or rotate the passcode anytime.' : 'Only authorized participants can see and hear the meeting.'}</span>
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
