import React, { useEffect, useRef, useState } from 'react';
import { Button, Input, Switch, Tooltip } from 'antd';
import { CheckCircleFilled, LoadingOutlined, PictureOutlined, UndoOutlined, UpOutlined, WarningOutlined } from '@ant-design/icons';
import { useAuth } from '../../../contexts/AuthContext';
import { call, errorText } from '../../Org/orgModel';
import type { AiDraft, AiPicture, AiStatus, CampaignFields } from './marketingModel';

/* The AI writer of the campaign editor: the administrator describes the
   campaign in their own words, the AI fills every field in French and in
   English, then makes a picture. Nothing is saved: the form and the preview
   show the result, to check and correct before saving. */

const en = (e: string) => e;

/** The AI mark: four-pointed sparkles. */
export const Sparkles: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false">
    <path d="M10 2.5c.4 3.9 2.6 6.1 6.5 6.5-3.9.4-6.1 2.6-6.5 6.5-.4-3.9-2.6-6.1-6.5-6.5 3.9-.4 6.1-2.6 6.5-6.5Z" />
    <path d="M18.5 13c.25 2.3 1.45 3.5 3.75 3.75-2.3.25-3.5 1.45-3.75 3.75-.25-2.3-1.45-3.5-3.75-3.75 2.3-.25 3.5-1.45 3.75-3.75Z" opacity=".75" />
  </svg>
);

const IDEAS: { label: string; text: string }[] = [
  {
    label: 'Exam group',
    text: 'New TCF Canada evening group starting [date], Tuesday and Thursday 7–8:30 pm Montréal time, for [number] weeks. [8] seats. Regular price [600] $, [480] $ if registered before [date]. Weekly corrected mock exams. Goal: NCLC 7 for Express Entry.',
  },
  {
    label: 'Free workshop',
    text: 'Free online workshop « Speak French without fear » on [date] at [time] Montréal time, 1 hour, for beginners and intermediate learners. Live with a native teacher, limited to [20] people.',
  },
  {
    label: 'Special offer',
    text: '[-20 %] on private lessons until [date] for new students. Packs of 10 lessons: [500] $ instead of [625] $. Book a free first call.',
  },
];

interface Props {
  /** True when the campaign already exists: the AI then changes it instead of writing it. */
  editing: boolean;
  /** The form as it is now. */
  fields: CampaignFields;
  /** The AI wrote the campaign: fill the form. */
  onDraft: (draft: AiDraft) => void;
  /** The AI made a picture. */
  onPicture: (key: string) => void;
  /** Put the form back as it was before the AI wrote (shown once something was written). */
  onUndo?: () => void;
}

type Phase = 'idle' | 'writing' | 'drawing';

const CampaignAi: React.FC<Props> = ({ editing, fields, onDraft, onPicture, onUndo }) => {
  const { apiCall } = useAuth();
  const [status, setStatus] = useState<AiStatus | null>(null);
  const [open, setOpen] = useState(!editing);
  const [brief, setBrief] = useState('');
  const [withPicture, setWithPicture] = useState(true);
  const [phase, setPhase] = useState<Phase>('idle');
  const [seconds, setSeconds] = useState(0);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<{ draft: AiDraft; picture?: AiPicture | null; pictureError?: string | null } | null>(null);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    call<AiStatus>(apiCall, '/admin/promotions/ai').then(s => { if (alive.current) setStatus(s); }).catch(() => { if (alive.current) setStatus(null); });
    return () => { alive.current = false; };
  }, [apiCall]);

  // A clock while the AI works: the writer takes up to a minute.
  useEffect(() => {
    if (phase === 'idle') return;
    setSeconds(0);
    const t = window.setInterval(() => setSeconds(s => s + 1), 1000);
    return () => window.clearInterval(t);
  }, [phase]);

  const hasContent = !!(fields.title_en || fields.title_fr);
  const unavailable = status !== null && !status.available;

  const run = async () => {
    setErr(null);
    setResult(null);
    setPhase('writing');
    try {
      const draft = await call<AiDraft>(apiCall, '/admin/promotions/ai/draft', 'POST', {
        brief,
        // An existing campaign, or a form already started, is changed rather than replaced.
        current: editing || hasContent ? fields : undefined,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        notes_lang: 'en',
      });
      if (!alive.current) return;
      onDraft(draft);
      setResult({ draft });
      if (!withPicture) return;
      setPhase('drawing');
      try {
        const picture = await call<AiPicture>(apiCall, '/admin/promotions/ai/image', 'POST', {
          prompt: draft.image_prompt, theme: draft.fields.theme, title: draft.fields.title_en || draft.fields.title_fr,
        });
        if (!alive.current) return;
        onPicture(picture.image_key);
        setResult({ draft, picture });
      } catch (e) {
        if (alive.current) setResult({ draft, pictureError: errorText(e, en) });
      }
    } catch (e) {
      if (alive.current) setErr(errorText(e, en));
    } finally {
      if (alive.current) setPhase('idle');
    }
  };

  const busy = phase !== 'idle';
  const modelLine = status?.available
    ? `${status.writing_model}${status.image_model ? ` · ${status.image_model}` : ''} · ${status.engine === 'vertex' ? 'Vertex AI' : 'Gemini API'}`
    : null;

  if (!open) {
    return (
      <button type="button" className="mk-ai-open" onClick={() => setOpen(true)}>
        <span className="mk-ai-mark"><Sparkles size={18} /></span>
        <span><strong>{editing ? 'Change it with AI' : 'Create it with AI'}</strong><em>Describe what you want: the AI writes it in French and English, with a new picture.</em></span>
      </button>
    );
  }

  return (
    <section className="mk-ai" aria-label="Create the campaign with AI">
      <header>
        <span className="mk-ai-mark"><Sparkles size={18} /></span>
        <div>
          <strong>{editing ? 'Change this campaign with AI' : 'Create the campaign with AI'}</strong>
          <span>{modelLine || 'Uses the platform’s AI engine (Admin → AI engine).'}</span>
        </div>
        <Tooltip title="Close"><Button type="text" size="small" icon={<UpOutlined />} onClick={() => setOpen(false)} aria-label="Close the AI panel" /></Tooltip>
      </header>

      {unavailable ? (
        <p className="mk-ai-off"><WarningOutlined /> The AI engine is not configured on the server. Set it up in Admin → AI engine, or fill the form by hand.</p>
      ) : (
        <>
          <Input.TextArea
            value={brief}
            onChange={e => setBrief(e.target.value)}
            autoSize={{ minRows: 4, maxRows: 10 }}
            maxLength={4000}
            disabled={busy}
            placeholder={editing || hasContent
              ? 'What should change? e.g. « Make it more urgent: only 3 seats left », « Add a Saturday morning group », « Price is now 450 $ until 15 December ».'
              : 'Describe the campaign in your words, in French or English: what it is, for whom, dates and times, price (and discount), number of seats, the teacher, the deadline… The AI only uses the facts you give and tells you what is missing.'}
          />
          {!editing && !brief && (
            <div className="mk-ai-ideas">
              <span>Start from:</span>
              {IDEAS.map(i => <button key={i.label} type="button" onClick={() => setBrief(i.text)}>{i.label}</button>)}
            </div>
          )}
          {!editing && brief.includes('[') && (
            <p className="mk-ai-hint">Replace what is in [brackets] with your details: anything left in brackets is reported as missing.</p>
          )}
          <div className="mk-ai-actions">
            <label className="mk-switch"><Switch size="small" checked={withPicture} onChange={setWithPicture} disabled={busy} /><span>Also create a new picture</span></label>
            <span style={{ flex: 1 }} />
            {onUndo && result && !busy && <Button icon={<UndoOutlined />} onClick={() => { onUndo(); setResult(null); }}>Undo</Button>}
            <Button type="primary" className="mk-ai-go" onClick={run} disabled={busy || brief.trim().length < 8} icon={busy ? <LoadingOutlined /> : <Sparkles />}>
              {busy ? 'Working…' : editing || hasContent ? 'Apply the changes' : 'Write the campaign'}
            </Button>
          </div>

          {busy && (
            <ol className="mk-ai-steps" aria-live="polite">
              <li className={phase === 'writing' ? 'is-on' : 'is-done'}>
                {phase === 'writing' ? <LoadingOutlined /> : <CheckCircleFilled />}
                Writing the campaign in French and English{phase === 'writing' ? ` · ${seconds} s (up to a minute)` : ''}
              </li>
              {withPicture && (
                <li className={phase === 'drawing' ? 'is-on' : ''}>
                  {phase === 'drawing' ? <LoadingOutlined /> : <PictureOutlined />}
                  Creating and checking the picture{phase === 'drawing' ? ` · ${seconds} s` : ''}
                </li>
              )}
            </ol>
          )}

          {err && <div className="og-check tone-bad"><WarningOutlined /><span>{err}</span></div>}

          {result && !busy && (
            <div className="mk-ai-result" aria-live="polite">
              <p className="mk-ai-done"><CheckCircleFilled /> Written by {result.draft.model}. The form and the preview are filled: read them, correct what is needed, then save.</p>
              {result.picture?.warning && <p className="mk-ai-warn"><WarningOutlined /> Picture: {result.picture.warning}</p>}
              {result.pictureError && <p className="mk-ai-warn"><WarningOutlined /> No new picture: {result.pictureError} A picture of the library is used meanwhile.</p>}
              {!!result.draft.notes.length && (
                <>
                  <p className="mk-ai-check">To check before publishing</p>
                  <ul>{result.draft.notes.map((n, i) => <li key={i}>{n}</li>)}</ul>
                </>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default CampaignAi;

/* A new picture for the campaign, from a description (Look section). */
export const AiPictureMaker: React.FC<{
  prompt: string;
  theme: CampaignFields['theme'];
  title: string | null;
  onPicture: (key: string) => void;
}> = ({ prompt: initial, theme, title, onPicture }) => {
  const { apiCall } = useAuth();
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ tone: 'bad' | 'warn'; text: string } | null>(null);
  useEffect(() => { setPrompt(initial); }, [initial]);

  const make = async () => {
    setBusy(true);
    setNote(null);
    try {
      const picture = await call<AiPicture>(apiCall, '/admin/promotions/ai/image', 'POST', { prompt, theme, title });
      onPicture(picture.image_key);
      if (picture.warning) setNote({ tone: 'warn', text: picture.warning });
      else setOpen(false);
    } catch (e) {
      setNote({ tone: 'bad', text: errorText(e, en) });
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return <Button icon={<Sparkles />} onClick={() => setOpen(true)} className="mk-ai-btn">New picture with AI</Button>;
  }
  return (
    <div className="mk-ai-picture">
      <Input.TextArea value={prompt} onChange={e => setPrompt(e.target.value)} autoSize={{ minRows: 2, maxRows: 5 }} maxLength={900} disabled={busy}
        placeholder="Who, where, doing what, the mood. e.g. « Three adults in a bright living room in Montréal, laughing during a French conversation class on a laptop seen from behind ». No text is ever drawn." />
      <div className="mk-ai-actions">
        <small>Takes about 15 seconds. The picture is checked for text and logos.</small>
        <span style={{ flex: 1 }} />
        <Button onClick={() => setOpen(false)} disabled={busy}>Cancel</Button>
        <Button type="primary" className="mk-ai-go" onClick={make} loading={busy} disabled={prompt.trim().length < 12} icon={busy ? undefined : <Sparkles />}>Create the picture</Button>
      </div>
      {note && <div className={`og-check tone-${note.tone}`}><WarningOutlined /><span>{note.text}</span></div>}
    </div>
  );
};
