// The form of an email campaign: the button of the email opens this page
// (/form/?t=… in English, /fr/formulaire/?t=… in French), already filled
// with the person's name and email. They answer; the school receives it.
//
// The page is pre-rendered once, without a link (?t=): it then reads its own
// link, asks the API for the form and draws it in the email's colours.
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO/SEO';
import { PATHS } from '../components/Landing/landingContent';
import { FORM_PATHS } from '../components/Landing/sitePages';
import type { Lang } from './model';
import './emailForm.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://api.learnfrenchwithnatives.com/api';

const FONTS: Record<string, string> = {
  system: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  humanist: "'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  georgia: "Georgia, 'Times New Roman', Times, serif",
  trebuchet: "'Trebuchet MS', 'Lucida Grande', Tahoma, sans-serif",
  verdana: "Verdana, Geneva, Tahoma, sans-serif",
};

interface Field { id: string; type: string; required: boolean; label: string; options?: string[] }
interface FormData {
  lang: Lang;
  preview: boolean;
  answered: boolean;
  campaign: { headline: string | null; eyebrow: string | null };
  form: { title: string; intro: string | null; submit: string; fields: Field[] };
  design: { primary: string; button_text: string; heading: string; header_bg: string; header_text: string; accent: string; soft: string; page_bg: string; font: string; heading_font: string; radius: number; button_shape: string };
  prefill: { name: string; email: string };
}

const WORDS = {
  en: {
    loading: 'Loading the form…', gone: 'This form is no longer available', goneText: 'The link may be incomplete or the form may have been removed.',
    home: 'Back to the site', required: 'required', optional: 'optional', sending: 'Sending…', error: 'Your answers could not be sent. Please try again.',
    preview: 'Preview: you can fill this form, nothing is saved.', already: 'You have already answered. Sending again replaces your previous answers.',
    privacy: 'Your answers go to Learn French with Natives only, to reply to you.', check: 'Check the fields in red.', invalidEmail: 'Invalid email address.', needed: 'This field is required.',
    choose: 'Choose…', title: 'Your answers',
  },
  fr: {
    loading: 'Chargement du formulaire…', gone: 'Ce formulaire n’est plus disponible', goneText: 'Le lien est peut-être incomplet, ou le formulaire a été retiré.',
    home: 'Retour au site', required: 'obligatoire', optional: 'facultatif', sending: 'Envoi…', error: 'Vos réponses n’ont pas pu être envoyées. Réessayez.',
    preview: 'Aperçu : vous pouvez remplir ce formulaire, rien n’est enregistré.', already: 'Vous avez déjà répondu. Un nouvel envoi remplace vos réponses précédentes.',
    privacy: 'Vos réponses sont envoyées uniquement à Learn French with Natives, pour vous répondre.', check: 'Vérifiez les champs en rouge.', invalidEmail: 'Adresse email invalide.', needed: 'Ce champ est obligatoire.',
    choose: 'Choisir…', title: 'Vos réponses',
  },
};
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function EmailFormPage({ lang: pageLang }: { lang: Lang }) {
  const [data, setData] = useState<FormData | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'gone' | 'sent'>('loading');
  const [values, setValues] = useState<Record<string, string | string[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [thanks, setThanks] = useState<{ title: string; text: string } | null>(null);
  const [trap, setTrap] = useState('');
  const token = typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get('t') || '';
  const lang: Lang = data?.lang || pageLang;
  const w = WORDS[lang];

  useEffect(() => {
    if (!token) { setState('gone'); return; }
    let alive = true;
    fetch(`${API_BASE}/public/email/form/${encodeURIComponent(token)}?lang=${pageLang}`)
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: FormData) => {
        if (!alive) return;
        setData(d);
        // The person's name and email are already there.
        const start: Record<string, string | string[]> = {};
        for (const f of d.form.fields) {
          if (f.type === 'name' && d.prefill.name) start[f.id] = d.prefill.name;
          if (f.type === 'email' && d.prefill.email) start[f.id] = d.prefill.email;
          if (f.type === 'checkbox') start[f.id] = [];
        }
        setValues(start);
        setState('ready');
      })
      .catch(() => { if (alive) setState('gone'); });
    return () => { alive = false; };
  }, [token, pageLang]);

  const style = useMemo(() => {
    if (!data) return undefined;
    const d = data.design;
    return {
      '--ef-primary': d.primary, '--ef-button-text': d.button_text, '--ef-heading': d.heading, '--ef-band': d.header_bg,
      '--ef-band-text': d.header_text, '--ef-accent': d.accent, '--ef-soft': d.soft, '--ef-page': d.page_bg,
      '--ef-font': FONTS[d.font] || FONTS.system, '--ef-heading-font': FONTS[d.heading_font] || FONTS.system,
      '--ef-radius': `${Math.min(d.radius, 20)}px`, '--ef-button-radius': d.button_shape === 'pill' ? '999px' : d.button_shape === 'square' ? '2px' : '10px',
    } as React.CSSProperties;
  }, [data]);

  const set = (id: string, v: string | string[]) => { setValues(x => ({ ...x, [id]: v })); setErrors(e => { const n = { ...e }; delete n[id]; return n; }); };

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    // Checked here first; the server checks again.
    const local: Record<string, string> = {};
    for (const f of data.form.fields) {
      const v = values[f.id];
      const empty = Array.isArray(v) ? !v.length : !String(v || '').trim();
      if (f.required && empty) local[f.id] = w.needed;
      else if (f.type === 'email' && !empty && !EMAIL_RE.test(String(v).trim())) local[f.id] = w.invalidEmail;
    }
    setErrors(local);
    if (Object.keys(local).length) { setProblem(w.check); return; }
    setBusy(true);
    setProblem(null);
    try {
      const r = await fetch(`${API_BASE}/public/email/form/${encodeURIComponent(token)}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: values, lang, website: trap }),
      });
      const out = await r.json().catch(() => ({}));
      if (!r.ok) {
        if (out.errors) setErrors(out.errors);
        setProblem(out.message || w.error);
        return;
      }
      setThanks({ title: out.thanks_title, text: out.thanks_text });
      setState('sent');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setProblem(w.error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="ef" style={style}>
      <SEO lang={pageLang} title={`${data?.form.title || w.title} · Learn French with Natives`} description={w.privacy} path={FORM_PATHS[pageLang]} noindex />
      <header className="ef-top">
        <Link to={PATHS[lang]} className="ef-brand" aria-label="Learn French with Natives">
          <img src="/assets/Logo.png" alt="" width={40} height={40} />
          <span><b>Learn French</b><i>with Natives</i></span>
        </Link>
      </header>
      <main id="main" className="ef-main">
        <article className="ef-card">
          <div className="ef-band">
            {data?.campaign.eyebrow && <p className="ef-eyebrow">{data.campaign.eyebrow}</p>}
            <h1>{state === 'sent' ? thanks?.title : state === 'gone' ? w.gone : data?.campaign.headline || data?.form.title || w.title}</h1>
          </div>
          <div className="ef-body">
            {state === 'loading' && <p className="ef-muted" role="status">{w.loading}</p>}
            {state === 'gone' && <>
              <p className="ef-muted">{w.goneText}</p>
              <Link className="ef-button" to={PATHS[pageLang]}>{w.home}</Link>
            </>}
            {state === 'sent' && <>
              <div className="ef-done" aria-hidden>✓</div>
              <p className="ef-lead">{thanks?.text}</p>
              <Link className="ef-button is-outline" to={PATHS[lang]}>{w.home}</Link>
            </>}
            {state === 'ready' && data && (
              <form onSubmit={send} noValidate>
                {data.preview && <p className="ef-note is-preview">{w.preview}</p>}
                {data.answered && <p className="ef-note">{w.already}</p>}
                <h2>{data.form.title}</h2>
                {data.form.intro && <p className="ef-lead">{data.form.intro}</p>}
                {data.form.fields.map(f => (
                  <FieldInput key={f.id} field={f} value={values[f.id]} error={errors[f.id]} words={w} onChange={v => set(f.id, v)} />
                ))}
                <div className="ef-trap" aria-hidden><label>Website<input tabIndex={-1} autoComplete="off" value={trap} onChange={e => setTrap(e.target.value)} /></label></div>
                {problem && <p className="ef-problem" role="alert">{problem}</p>}
                <button type="submit" className="ef-button" disabled={busy}>{busy ? w.sending : data.form.submit}</button>
                <p className="ef-privacy">{w.privacy}</p>
              </form>
            )}
          </div>
        </article>
      </main>
    </div>
  );
}

function FieldInput({ field: f, value, error, words, onChange }: {
  field: Field; value: string | string[] | undefined; error?: string; words: (typeof WORDS)['en']; onChange: (v: string | string[]) => void;
}) {
  const id = `ef-${f.id}`;
  const label = (
    <label className="ef-label" htmlFor={['radio', 'checkbox'].includes(f.type) ? undefined : id}>
      {f.label}<em>{f.required ? words.required : words.optional}</em>
    </label>
  );
  const common = { id, 'aria-invalid': !!error, 'aria-describedby': error ? `${id}-error` : undefined, required: f.required };
  let input: React.ReactNode;
  if (f.type === 'textarea') input = <textarea {...common} rows={4} maxLength={4000} value={String(value || '')} onChange={e => onChange(e.target.value)} />;
  else if (f.type === 'select') {
    input = (
      <select {...common} value={String(value || '')} onChange={e => onChange(e.target.value)}>
        <option value="">{words.choose}</option>
        {(f.options || []).map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  } else if (f.type === 'radio' || f.type === 'checkbox') {
    const many = f.type === 'checkbox';
    const chosen = Array.isArray(value) ? value : value ? [value] : [];
    input = (
      <div className="ef-choices" role={many ? 'group' : 'radiogroup'} aria-label={f.label}>
        {(f.options || []).map(o => (
          <label key={o} className={`ef-choice${chosen.includes(o) ? ' is-on' : ''}`}>
            <input type={many ? 'checkbox' : 'radio'} name={id} value={o} checked={chosen.includes(o)}
              onChange={() => onChange(many ? (chosen.includes(o) ? chosen.filter(x => x !== o) : [...chosen, o]) : o)} />
            <span>{o}</span>
          </label>
        ))}
      </div>
    );
  } else {
    const type = f.type === 'email' ? 'email' : f.type === 'phone' ? 'tel' : f.type === 'date' ? 'date' : 'text';
    const auto = f.type === 'name' ? 'name' : f.type === 'email' ? 'email' : f.type === 'phone' ? 'tel' : undefined;
    input = <input {...common} type={type} autoComplete={auto} maxLength={f.type === 'email' ? 254 : 300} value={String(value || '')} onChange={e => onChange(e.target.value)} />;
  }
  return (
    <div className={`ef-field${error ? ' has-error' : ''}`}>
      {label}
      {input}
      {error && <p id={`${id}-error`} className="ef-error">{error}</p>}
    </div>
  );
}
