// The building blocks every placement of a campaign shares: the picture with
// its theme, the countdown, the seats meter, the price, the facts, and the card.
import React from 'react';
import { ArrowRightOutlined, CalendarOutlined, CheckCircleFilled, ClockCircleOutlined, FireFilled, TeamOutlined, UserOutlined } from '@ant-design/icons';
import { COPY } from './copy';
import { dateRange, priceOf, promoImage, weeksBetween, type Lang, type Promotion } from './model';
import { ctaLabel, useTimeLeft, wordsOf } from './text';
import './promo.css';

/** "Registration closes in 3 d 04 h 12 min": boxes, or one line of text. */
export function Countdown({ promo, lang, variant = 'boxes' }: { promo: Promotion; lang: Lang; variant?: 'boxes' | 'inline' }) {
  const c = COPY[lang];
  const left = useTimeLeft(promo.countdown ? promo.ends_at : null);
  if (!left) return null;
  const two = (n: number) => String(n).padStart(2, '0');
  const parts: [string, string][] = left.days >= 1
    ? [[String(left.days), c.unit.d], [two(left.hours), c.unit.h], [two(left.minutes), c.unit.m]]
    : [[two(left.hours), c.unit.h], [two(left.minutes), c.unit.m], [two(left.seconds), c.unit.s]];
  if (variant === 'inline') {
    return (
      <span className="pm-count-inline" role="timer">
        <ClockCircleOutlined aria-hidden />
        <span><i>{c.endsIn}</i> <b>{parts.map(([n, u]) => `${n} ${u}`).join(' ')}</b></span>
      </span>
    );
  }
  return (
    <div className={`pm-count${left.days < 1 ? ' is-urgent' : ''}`} role="timer" aria-label={`${c.endsIn} ${parts.map(([n, u]) => `${n} ${u}`).join(' ')}`}>
      <span className="pm-count-label">{left.days < 1 ? c.lastDay : c.endsIn}</span>
      <span className="pm-count-boxes" aria-hidden>
        {parts.map(([n, u]) => <span key={u}><b>{n}</b><i>{u}</i></span>)}
      </span>
    </div>
  );
}

/** "4 of 12 seats left", with a bar that fills as the group does. */
export function Seats({ promo, lang, bare = false }: { promo: Promotion; lang: Lang; bare?: boolean }) {
  const c = COPY[lang];
  if (promo.full) return <p className="pm-seats is-full"><TeamOutlined aria-hidden />{c.full}</p>;
  if (!promo.seats) return null;
  const { left, limit } = promo.seats;
  const low = left <= Math.max(2, Math.ceil(limit * 0.25));
  return (
    <div className={`pm-seats${low ? ' is-low' : ''}`}>
      <span>{low ? <FireFilled aria-hidden /> : <TeamOutlined aria-hidden />}{bare ? c.seatsLeft(left) : c.seatsOf(left, limit)}</span>
      {!bare && <i aria-hidden><b style={{ transform: `scaleX(${Math.min(1, (limit - left) / limit)})` }} /></i>}
    </div>
  );
}

export function Price({ promo, lang, size = 'md' }: { promo: Promotion; lang: Lang; size?: 'md' | 'lg' }) {
  const price = priceOf(promo, lang);
  if (!price) return null;
  const note = wordsOf(promo, lang).price_note;
  return (
    <p className={`pm-price is-${size}`}>
      {price.was && <s>{price.was}</s>}
      <strong>{price.now}</strong>
      {note && !price.free && <small>{note}</small>}
      {price.percent ? <em>{COPY[lang].save(price.percent)}</em> : null}
    </p>
  );
}

/** Dates, schedule, level and teacher, as short lines with an icon. */
export function Facts({ promo, lang, full = false }: { promo: Promotion; lang: Lang; full?: boolean }) {
  const c = COPY[lang];
  const w = wordsOf(promo, lang);
  const dates = dateRange(promo.class_starts_on, promo.class_ends_on, lang);
  const weeks = weeksBetween(promo.class_starts_on, promo.class_ends_on);
  const rows: [React.ReactNode, string, string][] = [];
  if (dates) rows.push([<CalendarOutlined />, promo.class_ends_on ? c.dates : c.starts, weeks ? `${dates} · ${c.weeks(weeks)}` : dates]);
  if (w.schedule) rows.push([<ClockCircleOutlined />, c.schedule, w.schedule]);
  if (full && promo.level) rows.push([<CheckCircleFilled />, c.level, promo.level]);
  if (full && promo.teacher) rows.push([<UserOutlined />, c.teacher, promo.teacher]);
  if (!rows.length) return null;
  return (
    <ul className={`pm-facts${full ? ' is-full' : ''}`}>
      {rows.map(([icon, label, value], i) => (
        <li key={i}><span aria-hidden>{icon}</span>{full && <small>{label}</small>}<span>{value}</span></li>
      ))}
    </ul>
  );
}

/** The coloured panel of a campaign: its theme, its picture, its badge and its kind. */
export function Visual({ promo, lang, children, eager = false, large = false }: { promo: Promotion; lang: Lang; children?: React.ReactNode; eager?: boolean; /** A tall panel: the full-size picture. */ large?: boolean }) {
  const w = wordsOf(promo, lang);
  const price = priceOf(promo, lang);
  const badge = w.badge || (price?.percent ? `-${price.percent} %` : null);
  return (
    <div className={`pm-visual${promo.image ? ' has-image' : ''}`}>
      {promo.image && <img src={promoImage(promo.image, large ? 1200 : 640)} alt="" loading={eager ? 'eager' : 'lazy'} width={large ? 1200 : 640} height={large ? 675 : 360} />}
      <span className="pm-visual-shade" aria-hidden />
      <span className="pm-visual-top">
        <span className="pm-kind">{COPY[lang].kinds[promo.kind]}{promo.level ? ` · ${promo.level}` : ''}</span>
        {badge && <span className="pm-badge">{badge}</span>}
      </span>
      {children}
    </div>
  );
}

interface CardProps {
  promo: Promotion;
  lang: Lang;
  /** Opens the campaign (its details and its form). */
  onOpen: (promo: Promotion) => void;
  registered?: boolean;
  variant?: 'card' | 'wide';
  /** Never focusable or clickable: a preview in the admin console. */
  inert?: boolean;
}

/** A campaign as a card: what it is, when, how many seats, how much, one button. */
export function PromoCard({ promo, lang, onOpen, registered = false, variant = 'card', inert = false }: CardProps) {
  const w = wordsOf(promo, lang);
  const c = COPY[lang];
  const open = () => { if (!inert) onOpen(promo); };
  return (
    <article className={`pm pm-card pm-t-${promo.theme}${variant === 'wide' ? ' is-wide' : ''}${promo.full ? ' is-full' : ''}`}>
      <Visual promo={promo} lang={lang} eager={variant === 'wide'} large={variant === 'wide'}>
        {variant === 'wide' && promo.countdown && <div className="pm-visual-bottom"><Countdown promo={promo} lang={lang} /></div>}
      </Visual>
      <div className="pm-card-body">
        <h3 className="pm-card-title">
          <button type="button" className="pm-stretch" onClick={open} tabIndex={inert ? -1 : 0}>{w.title}</button>
        </h3>
        {w.tagline && <p className="pm-card-tagline">{w.tagline}</p>}
        <Facts promo={promo} lang={lang} />
        {variant === 'wide' && w.highlights.length > 0 && (
          <ul className="pm-points">{w.highlights.slice(0, 4).map((h, i) => <li key={i}><CheckCircleFilled aria-hidden />{h}</li>)}</ul>
        )}
        <Seats promo={promo} lang={lang} />
        {variant !== 'wide' && <Countdown promo={promo} lang={lang} variant="inline" />}
        <div className="pm-card-foot">
          <Price promo={promo} lang={lang} />
          {registered
            ? <span className="pm-registered"><CheckCircleFilled aria-hidden />{c.registered}</span>
            : <button type="button" className="pm-cta" onClick={open} tabIndex={inert ? -1 : 0}>{ctaLabel(promo, lang)}<ArrowRightOutlined aria-hidden /></button>}
        </div>
      </div>
    </article>
  );
}
