// Pieces shared by the pages of the practice space: the skill tabs, a text’s
// card and status, and the reading score.
import { Link } from 'react-router-dom';
import { ArrowRightOutlined, CheckCircleFilled, ClockCircleOutlined, CrownFilled, LockOutlined, ReadOutlined, SoundOutlined } from '@ant-design/icons';
import { itemTier } from '../access';
import { openPremiumModal } from '../account/premiumModal';
import { LockActionPill } from '../account/PremiumWidget';
import { isTierLocked, useAccount } from '../account/store';
import { imageUrl } from '../categories';
import type { Progress } from '../progress';
import { LevelChip, useMounted } from '../shell';
import { tx, type Lang } from '../types';
import { P } from './copy';
import { SKILLS, TEXTS, practicePath, readingPath, skillPath, textMinutes, textPath } from './meta';
import { skillOverview } from './overview';
import { textStatus } from './stats';
import type { SkillId, TextMeta } from './types';
import './practice.css';

/**
 * The practice space, announced on the free-courses home: what the learner will
 * practise, and its five skills (the open ones lead to their library).
 */
export function PracticePromo({ lang }: { lang: Lang }) {
  const c = P[lang];
  const p = c.practice;
  return (
    <aside className="rx-promo px-promo" aria-labelledby="px-promo-title">
      <div className="rx-promo-copy">
        <p className="rx-promo-k"><span className="rx-new">{c.isNew}</span>{p.promoEyebrow}</p>
        <h2 id="px-promo-title">{p.promoTitle[0]} <em>{p.promoTitle[1]}</em></h2>
        <p>{p.promo}</p>
        <Link to={practicePath(lang)} className="lp-btn lp-btn-light">{p.promoCta}<ArrowRightOutlined /></Link>
      </div>
      <ul className="px-promo-list">
        {skillOverview(lang).map(s => {
          const inner = (
            <>
              <span className="px-promo-ico" aria-hidden>{s.icon}</span>
              <span className="px-promo-txt">
                <b>{s.name}</b>
                <small>{s.ready ? [s.count ?? s.line, s.levels].filter(Boolean).join(' · ') : s.line}</small>
              </span>
              {s.ready ? <ArrowRightOutlined aria-hidden className="px-promo-go" /> : <span className="px-promo-soon">{c.soon}</span>}
            </>
          );
          return (
            <li key={s.id}>
              {s.ready && s.path
                ? <Link to={s.path}>{inner}</Link>
                : <div className="is-soon" aria-disabled="true" title={c.soonTitle}>{inner}</div>}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

/** The reading library, announced on the Reading path. */
export function ReadingPromo({ lang }: { lang: Lang }) {
  const c = P[lang];
  const picks = TEXTS.filter(t => t.starter).slice(0, 3);
  return (
    <aside className="rx-promo" aria-labelledby="rx-promo-title">
      <div className="rx-promo-copy">
        <p className="rx-promo-k"><span className="rx-new">{c.isNew}</span>{c.library.eyebrow}</p>
        <h2 id="rx-promo-title">{c.library.title[0]} <em>{c.library.title[1]}</em></h2>
        <p>{c.promo}</p>
        <Link to={readingPath(lang)} className="lp-btn lp-btn-light">{c.promoCta}<ArrowRightOutlined /></Link>
      </div>
      <ul className="rx-promo-list">
        {picks.map(t => (
          <li key={t.id}>
            <Link to={textPath(t, lang)}>
              <img src={imageUrl(t.image, 640)} alt="" loading="lazy" width="640" height="360" />
              <span className="rx-promo-txt"><b>{t.title}</b><small><LevelChip level={t.level} size="sm" /> {c.learn.genre[t.genre]} · {c.learn.audio}</small></span>
              <SoundOutlined aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export function StatusChip({ p, text, lang }: { p: Progress; text: TextMeta; lang: Lang }) {
  const mounted = useMounted();
  const l = P[lang].learn;
  const { status, best, total } = mounted ? textStatus(p, text) : { status: 'todo' as const, best: 0, total: text.questions };
  return (
    <span className={`rx-status is-${status}`}>
      {status === 'done' ? <CheckCircleFilled aria-hidden /> : <i aria-hidden />}
      {status === 'todo' ? l.status.todo : status === 'done' ? l.status.done(best, total) : l.status.review(best, total)}
    </span>
  );
}

export function TextCard({ text, lang, p }: { text: TextMeta; lang: Lang; p: Progress }) {
  const c = P[lang];
  const account = useAccount();
  const tier = itemTier(`text:${text.id}`);
  const locked = isTierLocked(account, tier);
  const href = textPath(text, lang);
  const onOpenModal = (e: React.MouseEvent) => {
    if (!locked) return;
    e.preventDefault();
    openPremiumModal({ title: text.title, subtitle: tx(text.subtitle, lang), tier, kind: 'practice', level: text.level, to: href });
  };
  return (
    <article className={`rx-card${locked ? ' ax-locked-card' : ''}`}>
      <div className={`rx-card-img${locked ? ' ax-locked-media' : ''}`}>
        <img src={imageUrl(text.image, 640)} alt="" loading="lazy" decoding="async" width="640" height="360" />
        {locked && (
          <div className="ax-locked-veil" aria-hidden>
            <span className={`ax-locked-veil-badge${tier === 'premium' ? ' is-premium' : ''}`}>
              {tier === 'premium' ? <CrownFilled /> : <LockOutlined />}
              {tier === 'premium' ? (lang === 'fr' ? 'Compte Premium requis' : 'Premium required') : (lang === 'fr' ? 'Compte gratuit requis' : 'Free account')}
            </span>
          </div>
        )}
        <LevelChip level={text.level} size="sm" />
        <span className="rx-card-genre-pill"><SoundOutlined aria-hidden /> {c.learn.genre[text.genre]}</span>
      </div>
      <div className={`rx-card-body${locked ? ' ax-locked-copy' : ''}`}>
        <p className="rx-card-kicker"><strong>{c.learn.genre[text.genre]}</strong> <span aria-hidden="true">·</span> {tx(text.theme, lang)}</p>
        <h3><Link to={href} onClick={onOpenModal} className="lx-stretch">{text.title}</Link></h3>
        <p className="rx-card-sub">{tx(text.subtitle, lang)}</p>
        <div className="rx-card-meta">
          <span><ReadOutlined aria-hidden /> {c.text.words(text.words)}</span>
          <span><ClockCircleOutlined aria-hidden /> {c.text.minutes(textMinutes(text))}</span>
        </div>
        <div className="rx-card-footer">
          <StatusChip p={p} text={text} lang={lang} />
          {locked
            ? <LockActionPill lang={lang} tier={tier} compact />
            : <span className="rx-card-go" aria-hidden="true">{c.library.readCard} <ArrowRightOutlined /></span>}
        </div>
      </div>
    </article>
  );
}

/** Reading, Listening, Dictation, Grammar, Vocabulary: the open ones are links. */
export function SkillTabs({ lang, active }: { lang: Lang; active?: SkillId }) {
  const c = P[lang];
  return (
    <nav className="rx-tabs" aria-label={c.skills}>
      <ul>
        {SKILLS.map(s => (
          <li key={s.id}>
            {s.ready ? (
              <Link to={skillPath(s, lang)} className={s.id === active ? 'is-on' : ''} aria-current={s.id === active ? 'page' : undefined}>
                {tx(s.name, lang)}
              </Link>
            ) : (
              <span className="is-soon" aria-disabled="true" title={c.soonTitle}>
                {tx(s.name, lang)}<small>{c.soon}</small>
              </span>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** A ring that fills with the reading score. */
export function ScoreRing({ value, label }: { value: number; label: string }) {
  const r = 52;
  const len = 2 * Math.PI * r;
  return (
    <div className="rx-ring" role="img" aria-label={label}>
      <svg viewBox="0 0 120 120" aria-hidden>
        <circle cx="60" cy="60" r={r} className="rx-ring-bg" />
        <circle cx="60" cy="60" r={r} className="rx-ring-fg" style={{ strokeDasharray: len, strokeDashoffset: len * (1 - value) }} />
      </svg>
      <b>{label}</b>
    </div>
  );
}
