// The account pages of the website: sign in, sign up (with the email code),
// forgotten password, the last step of a Google sign-up, and "My account".
// Pre-rendered as empty forms (never indexed); what depends on the person
// appears once the page runs in the browser.
import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRightOutlined, CheckCircleFilled, CrownFilled, EyeInvisibleOutlined, EyeOutlined, LaptopOutlined,
  LoadingOutlined, LockOutlined, LogoutOutlined, MailOutlined, SafetyCertificateOutlined, UserOutlined,
} from '@ant-design/icons';
import { LearnShell, useMounted } from '../shell';
import { hubPath } from '../paths';
import type { Lang } from '../types';
import { apiUrl, siteApi, type ApiError } from './api';
import { ACCOUNT_COPY, errorText } from './copy';
import { countries, guessCountry } from './countries';
import { accountPath, safeNext, type AccountPage } from './paths';
import { PremiumRequest } from './AccessGate';
import { BillingSection } from './Billing';
import { loadAccount, setAccount, signedIn, signOut, useAccount, type SiteAccess, type SiteUser } from './store';
import './account.css';

import { LEGAL_PATHS } from '../../legal/paths';

const TERMS_URL = (import.meta.env.VITE_TERMS_URL as string | undefined) || '';
const PRIVACY_URL = (import.meta.env.VITE_PRIVACY_URL as string | undefined) || '';

type Copy = (typeof ACCOUNT_COPY)['en'];
const asError = (e: unknown) => e as ApiError;

/** The query string, read in the browser only (the pre-rendered page has none). */
function useQuery() {
  const { search } = useLocation();
  const mounted = useMounted();
  return useMemo(() => new URLSearchParams(mounted ? search : ''), [search, mounted]);
}

// ── Building blocks ──

function Frame({ lang, page, title, sub, children, aside = true }: { lang: Lang; page: AccountPage; title: string; sub?: string; children: ReactNode; aside?: boolean }) {
  const c = ACCOUNT_COPY[lang];
  const alternates = { en: accountPath(page, 'en'), fr: accountPath(page, 'fr') };
  return (
    <LearnShell lang={lang} alternates={alternates} seo={{ title: `${title} | Learn French with Natives`, description: sub || title, path: alternates[lang], noindex: true }}>
      <section className="ax-wrap">
        <div className={`lp-wrap ax-grid${aside ? '' : ' is-single'}`}>
          <div className="ax-card">
            <h1 className="ax-title">{title}</h1>
            {sub && <p className="ax-sub">{sub}</p>}
            {children}
          </div>
          {aside && (
            <aside className="ax-aside" aria-label={c.signUpTitle}>
              <p className="ax-aside-k"><SafetyCertificateOutlined aria-hidden /> Learn French with Natives</p>
              <ul>{c.perks.map(p => <li key={p}><CheckCircleFilled aria-hidden />{p}</li>)}</ul>
            </aside>
          )}
        </div>
      </section>
    </LearnShell>
  );
}

function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="ax-field">
      <span>{label}</span>
      {children}
      {hint && <small className="ax-hint">{hint}</small>}
    </label>
  );
}

function PasswordInput({ c, value, onChange, autoComplete, id }: { c: Copy; value: string; onChange: (v: string) => void; autoComplete: string; id?: string }) {
  const [show, setShow] = useState(false);
  return (
    <span className="ax-pass">
      <input id={id} type={show ? 'text' : 'password'} value={value} onChange={e => onChange(e.target.value)} autoComplete={autoComplete} required maxLength={128} />
      <button type="button" onClick={() => setShow(s => !s)} aria-label={show ? c.hidePassword : c.showPassword} title={show ? c.hidePassword : c.showPassword}>
        {show ? <EyeInvisibleOutlined /> : <EyeOutlined />}
      </button>
    </span>
  );
}

function ErrorLine({ text }: { text: string }) {
  return text ? <p className="ax-error" role="alert">{text}</p> : null;
}

function GoogleButton({ lang, next, label }: { lang: Lang; next: string; label: string }) {
  const href = apiUrl(`/site-auth/google/start?lang=${lang}&next=${encodeURIComponent(next)}`);
  return (
    <a className="ax-google" href={href}>
      <svg viewBox="0 0 48 48" width="18" height="18" aria-hidden>
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
      </svg>
      {label}
    </a>
  );
}

function CountrySelect({ lang, c, value, onChange }: { lang: Lang; c: Copy; value: string; onChange: (v: string) => void }) {
  const list = countries(lang);
  return (
    <select value={value} onChange={e => onChange(e.target.value)} required>
      <option value="">{c.chooseCountry}</option>
      {list.map(o => <option key={o.code} value={o.code}>{o.name}</option>)}
    </select>
  );
}

function TermsLine({ c, lang }: { c: Copy; lang: Lang }) {
  const parts = c.terms(TERMS_URL || LEGAL_PATHS.terms[lang], PRIVACY_URL || LEGAL_PATHS.privacy[lang]);
  return (
    <>
      {parts.map((p, i) => (typeof p === 'string' ? <span key={i}>{p}</span>
        : p[1] ? <a key={i} href={p[1]} target="_blank" rel="noopener noreferrer">{p[0]}</a> : <span key={i}>{p[0]}</span>))}
    </>
  );
}

/** Where to go after signing in: the page the person came from, else My account. */
function useNext(lang: Lang) {
  const q = useQuery();
  return safeNext(q.get('next'), lang);
}

// ── Sign in ──

export function SignInPage({ lang }: { lang: Lang }) {
  const c = ACCOUNT_COPY[lang];
  const q = useQuery();
  const navigate = useNavigate();
  const account = useAccount();
  const next = useNext(lang);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const linking = q.get('link') === 'google';

  useEffect(() => {
    const e = q.get('error');
    if (e) setError(errorText(lang, { code: e }));
    if (linking && q.get('email')) setEmail(q.get('email') || '');
  }, [q, lang, linking]);
  // Already signed in: straight on.
  useEffect(() => { if (account.user && !linking) navigate(next, { replace: true }); }, [account.user, linking, next, navigate]);

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    setBusy(true);
    setError('');
    try {
      const data = await siteApi<{ user: SiteUser; access: SiteAccess; next?: string }>(linking ? '/site-auth/google/link' : '/site-auth/login', { body: linking ? { password } : { email, password } });
      signedIn(data);
      navigate(data.next ? safeNext(data.next, lang) : next, { replace: true });
    } catch (e) {
      setError(errorText(lang, asError(e)));
      setBusy(false);
    }
  };

  return (
    <Frame lang={lang} page="signIn" title={linking ? c.linkGoogleTitle : c.signInTitle} sub={linking ? c.linkGoogleText(email) : c.signInSub}>
      {!linking && account.google && (
        <>
          <GoogleButton lang={lang} next={next} label={c.google} />
          <p className="ax-or"><span>{c.orDivider}</span></p>
        </>
      )}
      <form className="ax-form" onSubmit={submit} noValidate={false}>
        {!linking && (
          <Field label={c.email}>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required maxLength={254} />
          </Field>
        )}
        <Field label={c.password}>
          <PasswordInput c={c} value={password} onChange={setPassword} autoComplete="current-password" />
        </Field>
        <ErrorLine text={error} />
        <button type="submit" className="lp-btn lp-btn-primary ax-submit" disabled={busy}>
          {busy ? <LoadingOutlined /> : <LockOutlined />}{linking ? c.linkGoogleButton : c.signIn}
        </button>
      </form>
      {!linking && (
        <div className="ax-links">
          <Link to={accountPath('forgot', lang)}>{c.forgot}</Link>
          <span>{c.noAccount} <Link to={accountPath('signUp', lang, next)}>{c.signUp}</Link></span>
        </div>
      )}
    </Frame>
  );
}

// ── Sign up ──

export function SignUpPage({ lang }: { lang: Lang }) {
  const c = ACCOUNT_COPY[lang];
  const q = useQuery();
  const navigate = useNavigate();
  const account = useAccount();
  const next = useNext(lang);
  const shownAt = useRef(0);
  const [step, setStep] = useState<'form' | 'code' | 'confirm' | 'done'>('form');
  const [f, setF] = useState({ first_name: '', email: '', password: '', country: '', terms: false, marketing: false, website: '' });
  const [suggestion, setSuggestion] = useState('');
  const [handle, setHandle] = useState('');
  const [code, setCode] = useState('');
  const [wait, setWait] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const set = (k: keyof typeof f) => (v: string | boolean) => setF(x => ({ ...x, [k]: v }));

  useEffect(() => {
    shownAt.current = Date.now();
    setF(x => (x.country ? x : { ...x, country: guessCountry() }));
  }, []);
  useEffect(() => { if (q.get('confirm')) setStep('confirm'); }, [q]);
  useEffect(() => {
    if (account.user && step === 'form' && !q.get('confirm')) navigate(next, { replace: true });
  }, [account.user, step, q, next, navigate]);
  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait(w => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const send = async (keepEmail = false, email = f.email) => {
    setBusy(true);
    setError('');
    setSuggestion('');
    try {
      const data = await siteApi<{ handle: string; resend_in: number }>('/site-auth/signup', {
        body: { ...f, email, lang, keep_email: keepEmail, elapsed_ms: Date.now() - shownAt.current },
      });
      setHandle(data.handle);
      setWait(data.resend_in || 60);
      setStep('code');
    } catch (e) {
      const err = asError(e);
      if (err.code === 'EMAIL_TYPO' && typeof err.suggestion === 'string') setSuggestion(err.suggestion);
      else setError(errorText(lang, err));
    } finally {
      setBusy(false);
    }
  };

  const finished = (data: { user: SiteUser; access: SiteAccess }) => {
    signedIn(data);
    setName(data.user.first_name);
    setStep('done');
  };

  const verify = async (ev: FormEvent) => {
    ev.preventDefault();
    setBusy(true);
    setError('');
    try {
      finished(await siteApi<{ user: SiteUser; access: SiteAccess }>('/site-auth/signup/verify', { body: { handle, code } }));
    } catch (e) {
      setError(errorText(lang, asError(e)));
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    setError('');
    try {
      const data = await siteApi<{ resend_in: number }>('/site-auth/signup/resend', { body: { handle } });
      setWait(data.resend_in || 60);
    } catch (e) {
      const err = asError(e);
      if (typeof err.resend_in === 'number') setWait(err.resend_in);
      setError(errorText(lang, err));
    }
  };

  const confirmLink = async () => {
    setBusy(true);
    setError('');
    try {
      finished(await siteApi<{ user: SiteUser; access: SiteAccess }>('/site-auth/signup/confirm', { body: { token: q.get('confirm') } }));
    } catch (e) {
      setError(errorText(lang, asError(e)));
    } finally {
      setBusy(false);
    }
  };

  if (step === 'done') {
    return (
      <Frame lang={lang} page="signUp" title={c.welcomeTitle(name)} sub={c.welcomeText} aside={false}>
        <div className="lp-hero-ctas">
          <Link to={next === accountPath('account', lang) ? hubPath(lang) : next} className="lp-btn lp-btn-primary">{c.startLearning}<ArrowRightOutlined /></Link>
          <Link to={accountPath('account', lang)} className="lp-btn lp-btn-ghost"><CrownFilled />{c.seePremium}</Link>
        </div>
      </Frame>
    );
  }

  if (step === 'confirm') {
    return (
      <Frame lang={lang} page="signUp" title={c.codeTitle} sub={c.confirming} aside={false}>
        <ErrorLine text={error} />
        <button type="button" className="lp-btn lp-btn-primary ax-submit" onClick={confirmLink} disabled={busy}>
          {busy ? <LoadingOutlined /> : <MailOutlined />}{lang === 'fr' ? 'Confirmer mon adresse' : 'Confirm my email'}
        </button>
        {error && <div className="ax-links"><Link to={accountPath('signIn', lang)}>{c.signIn}</Link><Link to={accountPath('signUp', lang)}>{c.signUp}</Link></div>}
      </Frame>
    );
  }

  if (step === 'code') {
    return (
      <Frame lang={lang} page="signUp" title={c.codeTitle} sub={c.codeSub(f.email)}>
        <form className="ax-form" onSubmit={verify}>
          <Field label={c.codeLabel}>
            <input className="ax-code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} required autoFocus />
          </Field>
          <ErrorLine text={error} />
          <button type="submit" className="lp-btn lp-btn-primary ax-submit" disabled={busy || code.length !== 6}>
            {busy ? <LoadingOutlined /> : <CheckCircleFilled />}{c.verify}
          </button>
        </form>
        <p className="ax-hint">{c.codeSpam}</p>
        <div className="ax-links">
          <button type="button" className="ax-linkbtn" onClick={resend} disabled={wait > 0}>{wait > 0 ? c.resendIn(wait) : c.resend}</button>
          <button type="button" className="ax-linkbtn" onClick={() => { setStep('form'); setCode(''); setError(''); }}>{c.changeEmail}</button>
        </div>
      </Frame>
    );
  }

  return (
    <Frame lang={lang} page="signUp" title={c.signUpTitle} sub={c.signUpSub}>
      {account.google && (
        <>
          <GoogleButton lang={lang} next={next} label={c.google} />
          <p className="ax-or"><span>{c.orDivider}</span></p>
        </>
      )}
      <form className="ax-form" onSubmit={e => { e.preventDefault(); send(); }}>
        <Field label={c.firstName}>
          <input value={f.first_name} onChange={e => set('first_name')(e.target.value)} autoComplete="given-name" required maxLength={50} />
        </Field>
        <Field label={c.email}>
          <input type="email" value={f.email} onChange={e => set('email')(e.target.value)} autoComplete="email" required maxLength={100} />
        </Field>
        {suggestion && (
          <div className="ax-suggest" role="status">
            <p>{c.typo(suggestion)}</p>
            <div>
              <button type="button" className="lp-btn lp-btn-primary" onClick={() => { set('email')(suggestion); send(false, suggestion); }}>{c.useSuggestion}</button>
              <button type="button" className="lp-btn lp-btn-ghost" onClick={() => send(true)}>{c.keepEmail}</button>
            </div>
          </div>
        )}
        <Field label={c.password} hint={c.passwordHint}>
          <PasswordInput c={c} value={f.password} onChange={set('password')} autoComplete="new-password" />
        </Field>
        <Field label={c.country}>
          <CountrySelect lang={lang} c={c} value={f.country} onChange={set('country')} />
        </Field>
        {/* Left empty by people, filled by robots. */}
        <input className="ax-hp" tabIndex={-1} autoComplete="off" aria-hidden value={f.website} onChange={e => set('website')(e.target.value)} name="website" />
        <label className="ax-check">
          <input type="checkbox" checked={f.terms} onChange={e => set('terms')(e.target.checked)} required />
          <span><TermsLine c={c} lang={lang} /></span>
        </label>
        <label className="ax-check">
          <input type="checkbox" checked={f.marketing} onChange={e => set('marketing')(e.target.checked)} />
          <span>{c.marketing}</span>
        </label>
        <ErrorLine text={error} />
        <button type="submit" className="lp-btn lp-btn-primary ax-submit" disabled={busy}>
          {busy ? <LoadingOutlined /> : <UserOutlined />}{c.signUp}
        </button>
      </form>
      <div className="ax-links"><span>{c.haveAccount} <Link to={accountPath('signIn', lang, next)}>{c.signIn}</Link></span></div>
    </Frame>
  );
}

// ── Forgotten password ──

export function ForgotPage({ lang }: { lang: Lang }) {
  const c = ACCOUNT_COPY[lang];
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [handle, setHandle] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const ask = async (ev: FormEvent) => {
    ev.preventDefault();
    setBusy(true);
    setError('');
    try {
      const data = await siteApi<{ handle: string }>('/site-auth/password/forgot', { body: { email, lang } });
      setHandle(data.handle);
    } catch (e) {
      setError(errorText(lang, asError(e)));
    } finally {
      setBusy(false);
    }
  };
  const reset = async (ev: FormEvent) => {
    ev.preventDefault();
    setBusy(true);
    setError('');
    try {
      const data = await siteApi<{ signed_in: boolean; user?: SiteUser; access?: SiteAccess }>('/site-auth/password/reset', { body: { handle, code, password } });
      if (data.signed_in && data.user && data.access) {
        signedIn({ user: data.user, access: data.access });
        navigate(accountPath('account', lang), { replace: true });
      } else setDone(true);
    } catch (e) {
      setError(errorText(lang, asError(e)));
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <Frame lang={lang} page="forgot" title={c.forgotTitle} sub={c.resetDone} aside={false}>
        <Link to={accountPath('signIn', lang)} className="lp-btn lp-btn-primary">{c.backToSignIn}</Link>
      </Frame>
    );
  }
  return (
    <Frame lang={lang} page="forgot" title={c.forgotTitle} sub={handle ? c.resetCodeSub(email) : c.forgotSub} aside={false}>
      {!handle ? (
        <form className="ax-form" onSubmit={ask}>
          <Field label={c.email}>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required maxLength={254} />
          </Field>
          <ErrorLine text={error} />
          <button type="submit" className="lp-btn lp-btn-primary ax-submit" disabled={busy}>{busy ? <LoadingOutlined /> : <MailOutlined />}{c.sendCode}</button>
        </form>
      ) : (
        <form className="ax-form" onSubmit={reset}>
          <Field label={c.codeLabel}>
            <input className="ax-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} required autoFocus />
          </Field>
          <Field label={c.newPassword} hint={c.passwordHint}>
            <PasswordInput c={c} value={password} onChange={setPassword} autoComplete="new-password" />
          </Field>
          <ErrorLine text={error} />
          <button type="submit" className="lp-btn lp-btn-primary ax-submit" disabled={busy || code.length !== 6}>{busy ? <LoadingOutlined /> : <LockOutlined />}{c.resetButton}</button>
        </form>
      )}
      <div className="ax-links"><Link to={accountPath('signIn', lang)}>{c.backToSignIn}</Link></div>
    </Frame>
  );
}

// ── Google sign-up: the last step ──

export function CompletePage({ lang }: { lang: Lang }) {
  const c = ACCOUNT_COPY[lang];
  const navigate = useNavigate();
  const [pending, setPending] = useState<{ email: string; first_name: string; last_name: string } | null>(null);
  const [f, setF] = useState({ first_name: '', last_name: '', country: '', terms: false, marketing: false });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    siteApi<{ email: string; first_name: string; last_name: string }>('/site-auth/google/pending')
      .then(p => { setPending(p); setF(x => ({ ...x, first_name: p.first_name, last_name: p.last_name, country: guessCountry() })); })
      .catch(e => setError(errorText(lang, asError(e))));
  }, [lang]);

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    setBusy(true);
    setError('');
    try {
      const data = await siteApi<{ user: SiteUser; access: SiteAccess; next?: string }>('/site-auth/google/complete', { body: { ...f, lang } });
      signedIn(data);
      navigate(safeNext(data.next, lang) === accountPath('account', lang) ? hubPath(lang) : safeNext(data.next, lang), { replace: true });
    } catch (e) {
      setError(errorText(lang, asError(e)));
      setBusy(false);
    }
  };

  return (
    <Frame lang={lang} page="complete" title={c.completeTitle} sub={pending ? c.completeSub(pending.email) : undefined}>
      {pending ? (
        <form className="ax-form" onSubmit={submit}>
          <Field label={c.firstName}>
            <input value={f.first_name} onChange={e => setF(x => ({ ...x, first_name: e.target.value }))} autoComplete="given-name" required maxLength={50} />
          </Field>
          <Field label={c.country}>
            <CountrySelect lang={lang} c={c} value={f.country} onChange={v => setF(x => ({ ...x, country: v }))} />
          </Field>
          <label className="ax-check">
            <input type="checkbox" checked={f.terms} onChange={e => setF(x => ({ ...x, terms: e.target.checked }))} required />
            <span><TermsLine c={c} lang={lang} /></span>
          </label>
          <label className="ax-check">
            <input type="checkbox" checked={f.marketing} onChange={e => setF(x => ({ ...x, marketing: e.target.checked }))} />
            <span>{c.marketing}</span>
          </label>
          <ErrorLine text={error} />
          <button type="submit" className="lp-btn lp-btn-primary ax-submit" disabled={busy}>{busy ? <LoadingOutlined /> : <CheckCircleFilled />}{c.completeButton}</button>
        </form>
      ) : (
        <>
          <ErrorLine text={error} />
          {error ? <Link to={accountPath('signUp', lang)} className="lp-btn lp-btn-primary">{c.signUp}</Link> : <p className="ax-loading" role="status"><LoadingOutlined /></p>}
        </>
      )}
    </Frame>
  );
}

// ── My account ──

interface Device { id: number; device: string; idle_seconds: number; current: boolean }

function ago(lang: Lang, seconds: number) {
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' });
  if (seconds < 60) return rtf.format(0, 'minute');
  if (seconds < 3600) return rtf.format(-Math.round(seconds / 60), 'minute');
  if (seconds < 86400) return rtf.format(-Math.round(seconds / 3600), 'hour');
  return rtf.format(-Math.round(seconds / 86400), 'day');
}

export function AccountPage({ lang }: { lang: Lang }) {
  const c = ACCOUNT_COPY[lang];
  const account = useAccount();
  const navigate = useNavigate();
  const q = useQuery();
  const { user, access } = account;

  useEffect(() => {
    if (account.status !== 'unknown' && !user) navigate(accountPath('signIn', lang, accountPath('account', lang)), { replace: true });
  }, [account.status, user, lang, navigate]);

  if (!user) {
    return (
      <Frame lang={lang} page="account" title={c.myAccount} aside={false}>
        <p className="ax-loading" role="status"><LoadingOutlined /></p>
      </Frame>
    );
  }
  const notice = q.get('google') === 'linked' ? c.googleLinked : q.get('error') ? errorText(lang, { code: q.get('error') || '' }) : '';
  return (
    <Frame lang={lang} page="account" title={c.accountTitle(user.first_name)} sub={user.email} aside={false}>
      {notice && <p className={`ax-note${q.get('error') ? ' is-warn' : ' is-ok'}`} role="status">{notice}</p>}
      <AccessCard lang={lang} c={c} access={access} payments={account.payments} freeForAll={account.mode === 'free'} />
      <BillingSection lang={lang} result={q.get('payment')} />
      <DetailsCard lang={lang} c={c} user={user} />
      <SecurityCard lang={lang} c={c} user={user} google={account.google} />
      {user.portal && (
        <section className="ax-section">
          <p>{c.portalNote}</p>
          <a className="lp-btn lp-btn-ghost" href="/app">{c.portalLink}<ArrowRightOutlined /></a>
        </section>
      )}
    </Frame>
  );
}

function AccessCard({ lang, c, access, payments, freeForAll }: { lang: Lang; c: Copy; access: SiteAccess; payments: boolean; freeForAll: boolean }) {
  const premium = access.level === 'premium';
  if (freeForAll && !premium) {
    return (
      <section className="ax-section ax-access">
        <h2>{c.accessTitle}</h2>
        <p className="ax-access-level"><UserOutlined aria-hidden /> <strong>{c.freeForAllTitle}</strong></p>
        <p>{c.freeForAllText}</p>
      </section>
    );
  }
  const until = access.premium?.until ? new Date(access.premium.until).toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA', { year: 'numeric', month: 'long', day: 'numeric' }) : null;
  return (
    <section className={`ax-section ax-access${premium ? ' is-premium' : ''}`}>
      <h2>{c.accessTitle}</h2>
      <p className="ax-access-level">{premium ? <CrownFilled aria-hidden /> : <UserOutlined aria-hidden />} <strong>{premium ? c.levelPremium : c.levelFree}</strong>
        {premium && access.premium && !access.staff && <span className="ax-access-until">{until ? c.until(until) : c.noEnd}{access.premium.via === 'company' ? `, ${c.viaCompany}` : ''}</span>}
      </p>
      <p>{access.staff ? c.staff : premium ? c.levelPremiumText : c.levelFreeText}</p>
      {!premium && !payments && (
        <>
          <p className="ax-hint">{c.premiumAskText}</p>
          <PremiumRequest lang={lang} withMessage />
        </>
      )}
    </section>
  );
}

function DetailsCard({ lang, c, user }: { lang: Lang; c: Copy; user: SiteUser }) {
  const [f, setF] = useState({ first_name: user.first_name, last_name: user.last_name, country: user.country || '', lang: user.lang || lang, marketing_opt_in: user.marketing_opt_in });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const learner = !user.portal;
  const save = async (ev: FormEvent) => {
    ev.preventDefault();
    setBusy(true);
    setMsg('');
    setError('');
    try {
      const body = learner ? f : { country: f.country, lang: f.lang, marketing_opt_in: f.marketing_opt_in };
      const data = await siteApi<{ user: SiteUser }>('/site-auth/me', { method: 'PUT', body });
      setAccount({ user: data.user });
      setMsg(c.saved);
    } catch (e) {
      setError(errorText(lang, asError(e)));
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="ax-section">
      <h2>{c.detailsTitle}</h2>
      <form className="ax-form ax-form-grid" onSubmit={save}>
        <Field label={c.firstName}><input value={f.first_name} disabled={!learner} onChange={e => setF(x => ({ ...x, first_name: e.target.value }))} maxLength={50} required /></Field>
        <Field label={c.lastName}><input value={f.last_name} disabled={!learner} onChange={e => setF(x => ({ ...x, last_name: e.target.value }))} maxLength={50} /></Field>
        <Field label={c.country}><CountrySelect lang={lang} c={c} value={f.country} onChange={v => setF(x => ({ ...x, country: v }))} /></Field>
        <Field label={c.langLabel}>
          <select value={f.lang} onChange={e => setF(x => ({ ...x, lang: e.target.value as Lang }))}>
            <option value="en">English</option>
            <option value="fr">Français</option>
          </select>
        </Field>
        <label className="ax-check ax-span">
          <input type="checkbox" checked={f.marketing_opt_in} onChange={e => setF(x => ({ ...x, marketing_opt_in: e.target.checked }))} />
          <span>{c.marketing}</span>
        </label>
        <div className="ax-span ax-row">
          <button type="submit" className="lp-btn lp-btn-primary" disabled={busy}>{busy ? <LoadingOutlined /> : null}{c.save}</button>
          {msg && <span className="ax-ok" role="status"><CheckCircleFilled /> {msg}</span>}
        </div>
        <ErrorLine text={error} />
      </form>
    </section>
  );
}

function SecurityCard({ lang, c, user, google }: { lang: Lang; c: Copy; user: SiteUser; google: boolean }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [devices, setDevices] = useState<Device[]>([]);

  const loadDevices = () => siteApi<{ sessions: Device[] }>('/site-auth/sessions').then(d => setDevices(d.sessions)).catch(() => {});
  useEffect(() => { loadDevices(); }, []);

  const changePassword = async (ev: FormEvent) => {
    ev.preventDefault();
    setBusy(true);
    setMsg('');
    setError('');
    try {
      await siteApi('/site-auth/password', { method: 'PUT', body: { current, password: next } });
      setMsg(c.passwordChanged);
      setCurrent('');
      setNext('');
      setOpen(false);
      await loadAccount(true);
      loadDevices();
    } catch (e) {
      setError(errorText(lang, asError(e)));
    } finally {
      setBusy(false);
    }
  };
  const unlinkGoogle = async () => {
    setError('');
    try {
      await siteApi('/site-auth/google', { method: 'DELETE' });
      await loadAccount(true);
    } catch (e) {
      setError(errorText(lang, asError(e)));
    }
  };
  const endDevice = async (d: Device) => {
    await siteApi(`/site-auth/sessions/${d.id}`, { method: 'DELETE' }).catch(() => {});
    if (d.current) window.location.reload(); else loadDevices();
  };

  return (
    <section className="ax-section">
      <h2>{c.securityTitle}</h2>
      {!open ? (
        <button type="button" className="lp-btn lp-btn-ghost" onClick={() => setOpen(true)}><LockOutlined />{user.has_password ? c.changePassword : c.setPassword}</button>
      ) : (
        <form className="ax-form" onSubmit={changePassword}>
          {user.has_password && <Field label={c.currentPassword}><PasswordInput c={c} value={current} onChange={setCurrent} autoComplete="current-password" /></Field>}
          <Field label={c.newPassword} hint={c.passwordHint}><PasswordInput c={c} value={next} onChange={setNext} autoComplete="new-password" /></Field>
          <div className="ax-row">
            <button type="submit" className="lp-btn lp-btn-primary" disabled={busy}>{busy ? <LoadingOutlined /> : null}{c.save}</button>
            <button type="button" className="ax-linkbtn" onClick={() => setOpen(false)}>×</button>
          </div>
        </form>
      )}
      {msg && <p className="ax-note is-ok" role="status">{msg}</p>}
      <ErrorLine text={error} />

      {(google || user.google_linked) && (
        <div className="ax-google-row">
          <p>{user.google_linked ? c.googleLinked : c.googleNotLinked}</p>
          {user.google_linked
            ? <button type="button" className="ax-linkbtn" onClick={unlinkGoogle}>{c.unlinkGoogle}</button>
            : <a className="ax-linkbtn" href={apiUrl(`/site-auth/google/start?lang=${lang}&mode=link&next=${encodeURIComponent(accountPath('account', lang))}`)}>{c.linkGoogle}</a>}
        </div>
      )}

      <h3>{c.devicesTitle}</h3>
      <ul className="ax-devices">
        {devices.map(d => (
          <li key={d.id}>
            <LaptopOutlined aria-hidden />
            <span><strong>{d.device}</strong><small>{d.current ? c.thisDevice : c.lastSeen(ago(lang, d.idle_seconds))}</small></span>
            <button type="button" className="ax-linkbtn" onClick={() => endDevice(d)}>{c.signOutDevice}</button>
          </li>
        ))}
      </ul>
      <div className="ax-row">
        <button type="button" className="lp-btn lp-btn-ghost" onClick={() => signOut(false)}><LogoutOutlined />{c.signOut}</button>
        <button type="button" className="ax-linkbtn" onClick={() => signOut(true)}>{c.signOutEverywhere}</button>
      </div>
    </section>
  );
}

/** The account page an address shows. */
export default function AccountRoute({ lang, page }: { lang: Lang; page: AccountPage }) {
  switch (page) {
    case 'signIn': return <SignInPage lang={lang} />;
    case 'signUp': return <SignUpPage lang={lang} />;
    case 'forgot': return <ForgotPage lang={lang} />;
    case 'complete': return <CompletePage lang={lang} />;
    default: return <AccountPage lang={lang} />;
  }
}
