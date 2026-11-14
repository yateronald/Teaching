// A campaign opened: everything about it on one side, the registration form on
// the other, then the confirmation. Shown above the page, on every public page.
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightOutlined, CheckCircleFilled, CheckOutlined, CloseOutlined, LoadingOutlined, LockOutlined } from '@ant-design/icons';
import { COPY } from './copy';
import { register, type Lang, type Placement, type Promotion, type RegistrationInput } from './model';
import { Countdown, Facts, Price, Seats, Visual } from './parts';
import { ctaLabel, wordsOf } from './text';
import { LEARN_HOME } from '../learn/entry';

interface Props {
  promo: Promotion;
  placement: Placement;
  lang: Lang;
  alreadyRegistered: boolean;
  onRegistered: (slug: string) => void;
  onClose: () => void;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const EMPTY: RegistrationInput = { fullName: '', email: '', phone: '', country: '', level: '', message: '', website: '' };

export default function PromoSheet({ promo, placement, lang, alreadyRegistered, onRegistered, onClose }: Props) {
  const c = COPY[lang];
  const f = c.form;
  const w = wordsOf(promo, lang);
  const hasForm = promo.registration.mode === 'form';
  const [input, setInput] = useState<RegistrationInput>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [done, setDone] = useState<null | 'new' | 'waitlist' | 'already'>(alreadyRegistered && hasForm ? 'already' : null);
  const dialog = useRef<HTMLDivElement | null>(null);
  const firstField = useRef<HTMLInputElement | null>(null);

  // The page behind stays still; Escape closes; the address can be shared.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const url = new URL(window.location.href);
    const had = url.searchParams.get('p');
    url.searchParams.set('p', promo.slug);
    window.history.replaceState(window.history.state, '', url);
    dialog.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      const back = new URL(window.location.href);
      if (had) back.searchParams.set('p', had); else back.searchParams.delete('p');
      window.history.replaceState(window.history.state, '', back);
      previous?.focus?.();
    };
  }, [promo.slug]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab' || !dialog.current) return;
      // Focus stays inside the sheet.
      const items = [...dialog.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([type="hidden"]):not([tabindex="-1"]), select, textarea')].filter(el => el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const set = (key: keyof RegistrationInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setInput(v => ({ ...v, [key]: e.target.value }));
  const nameBad = input.fullName.trim().length < 2;
  const emailBad = !EMAIL.test(input.email.trim());

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (nameBad || emailBad) { setError(null); firstField.current?.focus(); return; }
    setBusy(true);
    setError(null);
    const result = await register(promo.slug, { ...input, fullName: input.fullName.trim(), email: input.email.trim() }, lang, placement);
    setBusy(false);
    if (!result.ok) { setError(result.message || f.error); return; }
    setDone(result.already ? 'already' : result.status === 'waitlist' ? 'waitlist' : 'new');
    onRegistered(promo.slug);
    dialog.current?.scrollTo?.({ top: 0 });
  };

  const paragraphs = (w.description || '').split(/\n\s*\n/).map(s => s.trim()).filter(Boolean);

  return (
    <div className="pm pm-sheet-back" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`pm-sheet pm-t-${promo.theme}`} role="dialog" aria-modal="true" aria-labelledby="pm-sheet-title" ref={dialog} tabIndex={-1}>
        <button type="button" className="pm-sheet-close" onClick={onClose} aria-label={c.close}><CloseOutlined /></button>

        <div className="pm-sheet-side">
          <Visual promo={promo} lang={lang} eager large>
            <div className="pm-sheet-headline">
              <h2 id="pm-sheet-title">{w.title}</h2>
              {w.tagline && <p>{w.tagline}</p>}
            </div>
          </Visual>
          <div className="pm-sheet-keys">
            <Price promo={promo} lang={lang} size="lg" />
            <Countdown promo={promo} lang={lang} />
            <Seats promo={promo} lang={lang} />
          </div>
        </div>

        <div className="pm-sheet-main">
          {done ? (
            <div className="pm-done" role="status">
              <span className="pm-done-icon" aria-hidden><CheckOutlined /></span>
              <h3>{done === 'waitlist' ? c.done.titleWait : done === 'already' ? c.done.titleAlready : c.done.title}</h3>
              <p>{done === 'waitlist' ? c.done.textWait(w.title || '') : done === 'already' ? c.done.textAlready : c.done.text(w.title || '')}</p>
              {done === 'new' && (
                <>
                  <p className="pm-done-next">{c.done.next}</p>
                  <ol className="pm-steps">{c.done.steps.map((s, i) => <li key={i}><span>{i + 1}</span>{s}</li>)}</ol>
                </>
              )}
              <div className="pm-done-actions">
                <Link to={LEARN_HOME[lang]} className="pm-cta" onClick={onClose}>{c.done.freeCourses}<ArrowRightOutlined aria-hidden /></Link>
                <button type="button" className="pm-ghost" onClick={onClose}>{c.done.back}</button>
              </div>
            </div>
          ) : (
            <>
              <section className="pm-sheet-about">
                {paragraphs.map((text, i) => <p key={i}>{text}</p>)}
                {w.highlights.length > 0 && (
                  <ul className="pm-points">{w.highlights.map((h, i) => <li key={i}><CheckCircleFilled aria-hidden />{h}</li>)}</ul>
                )}
                <Facts promo={promo} lang={lang} full />
              </section>

              {hasForm && (
                <form className="pm-form" onSubmit={submit} noValidate>
                  <h3>{promo.full ? f.titleWait : f.title}</h3>
                  <p className="pm-form-sub">{promo.full ? f.subWait : f.sub}</p>
                  <div className="pm-fields">
                    <label className={`pm-field${touched && nameBad ? ' is-bad' : ''}`}>
                      <span>{f.name}</span>
                      <input ref={firstField} type="text" autoComplete="name" value={input.fullName} onChange={set('fullName')} maxLength={140} required aria-invalid={touched && nameBad} />
                      {touched && nameBad && <em>{f.nameError}</em>}
                    </label>
                    <label className={`pm-field${touched && emailBad ? ' is-bad' : ''}`}>
                      <span>{f.email}</span>
                      <input type="email" autoComplete="email" inputMode="email" value={input.email} onChange={set('email')} maxLength={255} required aria-invalid={touched && emailBad} />
                      {touched && emailBad && <em>{f.emailError}</em>}
                    </label>
                    <label className="pm-field">
                      <span>{f.phone} <i>{f.optional}</i></span>
                      <input type="tel" autoComplete="tel" inputMode="tel" value={input.phone} onChange={set('phone')} maxLength={40} placeholder="+1 514 555 0100" />
                    </label>
                    <label className="pm-field">
                      <span>{f.country} <i>{f.optional}</i></span>
                      <input type="text" autoComplete="country-name" value={input.country} onChange={set('country')} maxLength={80} />
                    </label>
                    <label className="pm-field is-wide">
                      <span>{f.level} <i>{f.optional}</i></span>
                      <select value={input.level} onChange={set('level')}>
                        <option value="">{f.levelPick}</option>
                        {f.levels.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </label>
                    <label className="pm-field is-wide">
                      <span>{f.message} <i>{f.optional}</i></span>
                      <textarea rows={2} value={input.message} onChange={set('message')} maxLength={1500} placeholder={f.messageHint} />
                    </label>
                    {/* Not for people: hidden from sight, from the keyboard and from screen readers. */}
                    <input type="text" name="website" className="pm-hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={input.website} onChange={set('website')} />
                  </div>
                  {error && <p className="pm-form-error" role="alert">{error}</p>}
                  <button type="submit" className="pm-cta is-block" disabled={busy}>
                    {busy ? <><LoadingOutlined aria-hidden />{f.sending}</> : <>{promo.full ? f.submitWait : (w.cta || f.submit)}<ArrowRightOutlined aria-hidden /></>}
                  </button>
                  <p className="pm-form-note"><LockOutlined aria-hidden />{f.consent}</p>
                </form>
              )}
              {promo.registration.mode === 'link' && promo.registration.url && (
                <a className="pm-cta is-block" href={promo.registration.url} {...(promo.registration.url.startsWith('/') ? {} : { target: '_blank', rel: 'noopener' })}>
                  {ctaLabel(promo, lang)}<ArrowRightOutlined aria-hidden />
                </a>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
