// /learn/practice/ and /fr/apprendre/pratique/: executive Practice Studio hub.
// 2-column hero with live dark studio overview card, 2 flagship skill cards
// with direct sub-track shortcuts, compact upcoming roadmap strip, and a live
// CEFR quick-start shelf to launch any exercise in 1 click.
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRightOutlined, AudioOutlined, CheckOutlined, ClockCircleOutlined,
  CommentOutlined, CompassOutlined, CustomerServiceOutlined, EditOutlined,
  ReadOutlined, SoundOutlined, ThunderboltOutlined,
} from '@ant-design/icons';
import { itemTier, type Tier } from '../../access';
import { openPremiumModal } from '../../account/premiumModal';
import { LockActionPill, PremiumInfoWidget } from '../../account/PremiumWidget';
import { freeForAllCopy, isTierLocked, useAccount } from '../../account/store';
import { imageUrl } from '../../categories';
import { absoluteMediaUrl } from '../../mediaUrl';
import { hubPath, placementPath } from '../../paths';
import { Crumbs, LearnShell, LevelChip, TeacherCta } from '../../shell';
import { LEVELS, tx, type Lang, type Level } from '../../types';
import { UI } from '../../ui';
import { P } from '../copy';
import { TEXTS, practicePath, readingPath, textPath } from '../meta';
import { MISSIONS, missionPath } from '../missions';
import { DIALOGUES, dialoguePath } from '../dialogues/meta';
import { EAR, earPath } from '../ear/meta';
import { LISTENING, exercisePath, listeningPath } from '../listening/catalog';
import { DICTATIONS, dictationCoursePath, dictationPath } from '../dictation/catalog';
import { skillOverview } from '../overview';
import { SkillTabs } from '../parts';
import '../practice.css';

const SITE = 'https://www.learnfrenchwithnatives.com';
const HOW_ICONS = [<ClockCircleOutlined />, <SoundOutlined />, <CheckOutlined />];

interface QuickPick {
  id: string;
  tierKey: string;
  kind: 'text' | 'mission' | 'dialogue' | 'ear' | 'doc';
  badge: string;
  title: string;
  summary: string;
  meta: string;
  level: Level;
  to: string;
  sample?: string;
}

export default function PracticeHubPage({ lang }: { lang: Lang }) {
  const c = P[lang];
  const p = c.practice;
  const ui = UI[lang];
  const account = useAccount();
  const freeAll = freeForAllCopy(account);
  const skills = skillOverview(lang);
  const openSkills = skills.filter(s => s.ready);
  const upcomingSkills = skills.filter(s => !s.ready);
  const [pickLevel, setPickLevel] = useState<Level>('A1');

  const readingTotal = TEXTS.length + MISSIONS.length;
  const listeningTotal = DIALOGUES.length + EAR.length + LISTENING.length;
  const dictationTotal = DICTATIONS.length;
  const totalAll = readingTotal + listeningTotal + dictationTotal;

  // Build 4 curated 1-click quick-start activities for the selected CEFR level.
  const quickPicks = useMemo<QuickPick[]>(() => {
    const out: QuickPick[] = [];
    const txt = TEXTS.find(t => t.level === pickLevel && t.starter) ?? TEXTS.find(t => t.level === pickLevel);
    if (txt) {
      out.push({
        id: `t-${txt.id}`,
        tierKey: `text:${txt.id}`,
        kind: 'text',
        badge: lang === 'fr' ? 'Texte · Audio' : 'Text · Audio',
        title: txt.title,
        summary: tx(txt.subtitle, lang),
        meta: c.text.words(txt.words),
        level: txt.level,
        to: textPath(txt, lang),
      });
    }
    const mis = MISSIONS.find(m => m.level === pickLevel);
    if (mis) {
      out.push({
        id: `m-${mis.id}`,
        tierKey: `mission:${mis.id}`,
        kind: 'mission',
        badge: lang === 'fr' ? 'Mission de lecture' : 'Reading mission',
        title: tx(mis.title, lang),
        summary: tx(mis.summary, lang),
        meta: `${mis.documentCount ?? mis.documents.length} ${lang === 'fr' ? 'étapes' : 'steps'} · ${mis.minutes} min`,
        level: mis.level,
        to: missionPath(mis, lang),
      });
    }
    const dlg = DIALOGUES.find(d => d.level === pickLevel);
    if (dlg) {
      out.push({
        id: `d-${dlg.id}`,
        tierKey: `dialogue:${dlg.id}`,
        kind: 'dialogue',
        badge: lang === 'fr' ? 'Dialogue' : 'Dialogue',
        title: dlg.title,
        summary: tx(dlg.summary, lang),
        meta: lang === 'fr' ? '2 voix · audio seul' : '2 voices · audio only',
        level: dlg.level,
        to: dialoguePath(dlg, lang),
      });
    }
    const earItems = EAR.filter(e => e.level === pickLevel);
    if (earItems[0]) {
      const e = earItems[0];
      out.push({
        id: `e-${e.id}`,
        tierKey: `ear:${e.id}`,
        kind: 'ear',
        badge: lang === 'fr' ? 'Entraîner son oreille' : 'Ear training',
        title: e.title,
        summary: tx(e.summary, lang),
        meta: `${e.items} ex. · ${e.minutes} min`,
        level: e.level,
        to: earPath(e, lang),
        sample: e.sample,
      });
    }
    const docItems = LISTENING.filter(e => e.level === pickLevel);
    for (const d of docItems) {
      if (out.length >= 4) break;
      out.push({
        id: `l-${d.id}`,
        tierKey: `doc:${d.id}`,
        kind: 'doc',
        badge: tx(d.format, lang),
        title: d.title,
        summary: tx(d.summary, lang),
        meta: `${d.count ?? d.questions.length} questions`,
        level: d.level,
        to: exercisePath(d, lang),
      });
    }
    for (const e of earItems.slice(1)) {
      if (out.length >= 4) break;
      out.push({
        id: `e-${e.id}`,
        tierKey: `ear:${e.id}`,
        kind: 'ear',
        badge: lang === 'fr' ? 'Entraîner son oreille' : 'Ear training',
        title: e.title,
        summary: tx(e.summary, lang),
        meta: `${e.items} ex. · ${e.minutes} min`,
        level: e.level,
        to: earPath(e, lang),
        sample: e.sample,
      });
    }
    return out.slice(0, 4);
  }, [pickLevel, lang, c.text]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${p.title[0]} ${p.title[1]}`,
    description: p.metaDescription,
    url: `${SITE}${practicePath(lang)}`,
    inLanguage: lang,
    isAccessibleForFree: true,
    hasPart: openSkills.filter(s => s.path).map(s => ({ '@type': 'CollectionPage', name: s.name, url: `${SITE}${s.path}` })),
  };

  return (
    <LearnShell
      lang={lang}
      alternates={{ en: practicePath('en'), fr: practicePath('fr') }}
      seo={{ title: p.metaTitle, description: p.metaDescription, path: practicePath(lang), jsonLd, image: absoluteMediaUrl(imageUrl('cat-reading')) }}
    >
      {/* ── Executive 2-Column Studio Hero ── */}
      <section className="rx-lib-hero px-hero" aria-labelledby="px-title">
        <div className="lp-wrap">
          <div className="rx-hero-bar">
            <Crumbs lang={lang} items={[[ui.learnHome, hubPath(lang)], [c.crumb]]} />
            <SkillTabs lang={lang} />
          </div>

          <div className="px-hero-grid">
            <div className="px-hero-copy">
              <p className="lp-eyebrow">{p.eyebrow} · A1–C2</p>
              <h1 id="px-title">{p.title[0]} <em>{p.title[1]}</em></h1>
              <p className="lx-hero-sub">{p.intro}</p>
              <div className="px-hero-ctas">
                <Link to={readingPath(lang)} className="lp-btn lp-btn-primary">
                  <ReadOutlined /> {lang === 'fr' ? 'Ouvrir la lecture' : 'Open reading'} <ArrowRightOutlined />
                </Link>
                <Link to={listeningPath(lang)} className="lp-btn lp-btn-ghost">
                  <CustomerServiceOutlined /> {lang === 'fr' ? 'Ouvrir l’écoute' : 'Open listening'}
                </Link>
              </div>
              <ul className="px-facts">
                {p.facts.map(f => <li key={f}><CheckOutlined aria-hidden />{f}</li>)}
              </ul>
            </div>

            <aside className="px-hero-card" aria-label={lang === 'fr' ? 'Vue d’ensemble de l’espace pratique' : 'Practice studio overview'}>
              <div className="px-hc-flag" aria-hidden><i /><i /><i /></div>
              <dl className="px-hc-stats">
                <div>
                  <dt>{totalAll}</dt>
                  <dd>{freeAll ? (lang === 'fr' ? 'activités gratuites' : 'free activities') : (lang === 'fr' ? 'activités pratiques' : 'practice activities')}</dd>
                </div>
                <div>
                  <dt>A1–C2</dt>
                  <dd>{lang === 'fr' ? 'tous les niveaux' : 'all CEFR levels'}</dd>
                </div>
                <div>
                  <dt>100 %</dt>
                  <dd>{lang === 'fr' ? 'voix natives' : 'native audio'}</dd>
                </div>
              </dl>
              <ul className="px-hc-links">
                <li>
                  <Link to={readingPath(lang)}>
                    <span className="px-hc-ico"><ReadOutlined /></span>
                    <span>
                      <strong>{lang === 'fr' ? 'Atelier de lecture' : 'Reading studio'}</strong>
                      <small>{TEXTS.length} {lang === 'fr' ? 'textes' : 'texts'} · {MISSIONS.length} {lang === 'fr' ? 'missions' : 'missions'} · A1–C1</small>
                    </span>
                    <ArrowRightOutlined className="px-hc-go" aria-hidden />
                  </Link>
                </li>
                <li>
                  <Link to={listeningPath(lang)}>
                    <span className="px-hc-ico"><CustomerServiceOutlined /></span>
                    <span>
                      <strong>{lang === 'fr' ? 'Atelier d’écoute' : 'Listening studio'}</strong>
                      <small>{DIALOGUES.length} dialogues · {EAR.length} {lang === 'fr' ? 'oreille' : 'ear'} · {LISTENING.length} docs · A1–C2</small>
                    </span>
                    <ArrowRightOutlined className="px-hc-go" aria-hidden />
                  </Link>
                </li>
                <li>
                  <Link to={dictationPath(lang)}>
                    <span className="px-hc-ico"><EditOutlined /></span>
                    <span>
                      <strong>{lang === 'fr' ? 'Atelier de dictée' : 'Dictation studio'}</strong>
                      <small>{dictationTotal} {lang === 'fr' ? (dictationTotal > 1 ? 'dictées' : 'dictée') : (dictationTotal > 1 ? 'dictations' : 'dictation')} · {lang === 'fr' ? '4 formats · A1–C2' : '4 methods · A1–C2'}</small>
                    </span>
                    <ArrowRightOutlined className="px-hc-go" aria-hidden />
                  </Link>
                </li>
              </ul>
              <Link to={placementPath(lang)} className="px-hc-foot">
                <ThunderboltOutlined aria-hidden />
                <span>{lang === 'fr' ? 'Pas sûr de votre niveau ? Test gratuit (10 min)' : 'Not sure of your level? Free 10-min test'}</span>
                <ArrowRightOutlined aria-hidden />
              </Link>
            </aside>
          </div>
        </div>
      </section>

      {/* ── Flagship Open Skills + Compact Upcoming Roadmap ── */}
      <section className="lp-section px-skills-sec" aria-labelledby="px-skills-title">
        <div className="lp-wrap">
          <header className="px-sec-head">
            <div>
              <p className="rxl-sec-k">{lang === 'fr' ? 'Ateliers ouverts' : 'Open studios'}</p>
              <h2 id="px-skills-title">{p.skillsTitle}</h2>
            </div>
            <p>{p.skillsSub}</p>
          </header>

          <ul className="px-flagships is-three">
            {openSkills.map(s => {
              const isReading = s.id === 'reading';
              const isListening = s.id === 'listening';
              const total = isReading ? readingTotal : isListening ? listeningTotal : dictationTotal;
              const levelSpan = isReading ? 'A1–C1' : 'A1–C2';
              const subtracks = isReading
                ? [
                    { label: lang === 'fr' ? 'Textes avec audio' : 'Texts with audio', count: TEXTS.length, to: `${readingPath(lang)}#texts`, icon: <ReadOutlined /> },
                    { label: lang === 'fr' ? 'Missions de lecture' : 'Reading missions', count: MISSIONS.length, to: `${readingPath(lang)}#missions`, icon: <CompassOutlined /> },
                  ]
                : isListening
                  ? [
                      { label: lang === 'fr' ? 'Dialogues du quotidien' : 'Everyday dialogues', count: DIALOGUES.length, to: `${listeningPath(lang)}#dialogues`, icon: <CommentOutlined /> },
                      { label: lang === 'fr' ? 'Entraîner son oreille' : 'Ear training', count: EAR.length, to: `${listeningPath(lang)}#ear`, icon: <AudioOutlined /> },
                      { label: lang === 'fr' ? 'Documents réels' : 'Real documents', count: LISTENING.length, to: `${listeningPath(lang)}#documents`, icon: <SoundOutlined /> },
                    ]
                  : [
                      { label: DICTATIONS[0].title, count: DICTATIONS.length, to: dictationCoursePath(DICTATIONS[0], lang), icon: <EditOutlined /> },
                      { label: lang === 'fr' ? '2 voix · Femme & Homme' : '2 voices · Woman & Man', count: 2, to: dictationPath(lang), icon: <SoundOutlined /> },
                    ];
              return (
                <li key={s.id}>
                  <article className="px-flagship">
                    <Link to={s.path!} className="px-flagship-img" tabIndex={-1} aria-hidden="true">
                      <img
                        src={imageUrl(s.image, 640)}
                        srcSet={`${imageUrl(s.image, 640)} 640w, ${imageUrl(s.image, 1200)} 1200w`}
                        sizes="(min-width: 1000px) 380px, calc(100vw - 36px)"
                        alt=""
                        width="640"
                        height="360"
                        loading="lazy"
                        decoding="async"
                      />
                      <span className="px-flagship-live">{lang === 'fr' ? 'Disponible' : 'Open now'}</span>
                      <span className="px-flagship-badge">
                        {total} {lang === 'fr' ? (total > 1 ? 'activités' : 'activité') : (total > 1 ? 'activities' : 'activity')} · {levelSpan}
                      </span>
                    </Link>

                    <div className="px-flagship-body">
                      <div className="px-flagship-top">
                        <span className="px-skill-ico" aria-hidden>{s.icon}</span>
                        <div>
                          <p className="px-flagship-k">{s.line}</p>
                          <h3><Link to={s.path!}>{s.name}</Link></h3>
                        </div>
                      </div>
                      <p className="px-flagship-desc">{s.desc}</p>

                      <div className="px-subtracks" aria-label={s.name}>
                        {subtracks.map(sub => (
                          <Link key={sub.label} to={sub.to} className="px-subtrack-chip">
                            {sub.icon}
                            <span>{sub.label}</span>
                            <b>{sub.count}</b>
                          </Link>
                        ))}
                      </div>

                      <div className="px-flagship-foot">
                        <Link to={s.path!} className="lp-btn lp-btn-primary lp-btn-sm">
                          {p.open} · {s.name} <ArrowRightOutlined />
                        </Link>
                      </div>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>

          {/* Compact Upcoming Skills Roadmap */}
          <div className="px-roadmap" aria-label={p.soonCard}>
            <div className="px-roadmap-head">
              <span className="px-roadmap-pill"><ClockCircleOutlined aria-hidden /> {p.soonCard}</span>
              <p>{p.soonNote}</p>
            </div>
            <ul className="px-roadmap-list">
              {upcomingSkills.map(s => (
                <li key={s.id} className="px-roadmap-item">
                  <span className="px-roadmap-ico" aria-hidden>{s.icon}</span>
                  <div>
                    <strong>{s.name} <small>{c.soon}</small></strong>
                    <p>{s.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Quick Start by Level (1-click launchpad) ── */}
      <section className="lp-section lp-tint px-picks-sec" aria-labelledby="px-picks-title">
        <div className="lp-wrap">
          <header className="px-picks-head">
            <div>
              <p className="rxl-sec-k">{lang === 'fr' ? 'Démarrage rapide' : 'Quick start'}</p>
              <h2 id="px-picks-title">
                {lang === 'fr' ? 'Essayez un exercice maintenant, selon votre niveau' : 'Try an exercise right now, at your level'}
              </h2>
            </div>
            <div className="rxl-level-pills" role="group" aria-label={ui.level}>
              {LEVELS.map(lv => (
                <button
                  key={lv}
                  type="button"
                  className={pickLevel === lv ? 'is-on' : ''}
                  aria-pressed={pickLevel === lv}
                  onClick={() => setPickLevel(lv)}
                >
                  <b>{lv}</b>
                </button>
              ))}
            </div>
          </header>

          <div className="lp-wrap"><PremiumInfoWidget lang={lang} variant="banner" /></div>

          <ul className="px-picks">
            {quickPicks.map(item => {
              const tier: Tier = itemTier(item.tierKey);
              const locked = isTierLocked(account, tier);
              return (
                <li key={item.id}>
                  <Link
                    to={item.to}
                    onClick={e => {
                      if (!locked) return;
                      e.preventDefault();
                      openPremiumModal({ title: item.title, subtitle: item.summary, tier, kind: 'practice', level: item.level, to: item.to });
                    }}
                    className={`px-pick is-${item.kind}${locked ? ' ax-locked-card ax-locked-copy' : ''}`}
                  >
                    <div className="px-pick-top">
                      <LevelChip level={item.level} size="sm" />
                      <span className="px-pick-badge">{item.badge}</span>
                    </div>
                    {item.sample && <p className="px-pick-sample" lang="fr">{item.sample}</p>}
                    <h3 lang="fr">{item.title}</h3>
                    <p className="px-pick-sum">{item.summary}</p>
                    <div className="px-pick-foot">
                      <span>{item.meta}</span>
                      {locked
                        ? <LockActionPill lang={lang} tier={tier} compact />
                        : <span className="px-pick-go" aria-hidden>{lang === 'fr' ? 'Essayer' : 'Try'} <ArrowRightOutlined /></span>}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="lp-section px-how-sec" aria-labelledby="px-how-title">
        <div className="lp-wrap">
          <header className="px-sec-head">
            <div>
              <p className="rxl-sec-k">{lang === 'fr' ? 'La méthode' : 'How it works'}</p>
              <h2 id="px-how-title">{p.howTitle}</h2>
            </div>
          </header>
          <ol className="rx-how">
            {p.how.map(([t, d], i) => (
              <li key={t}>
                <span className="rx-how-n" aria-hidden>{HOW_ICONS[i]}</span>
                <strong>{t}</strong>
                <p>{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Placement Test + Native Teacher Banner ── */}
      <section className="lp-section lp-tint px-start-sec" aria-labelledby="px-start-title">
        <div className="lp-wrap px-start">
          <div className="px-start-card">
            <p className="rxl-sec-k">{lang === 'fr' ? 'Évaluation gratuite' : 'Free assessment'}</p>
            <h2 id="px-start-title">{p.startTitle}</h2>
            <p>{p.startText}</p>
            <Link to={placementPath(lang)} className="lp-btn lp-btn-primary">{p.startCta} <ArrowRightOutlined /></Link>
          </div>
          <TeacherCta lang={lang} compact />
        </div>
      </section>
    </LearnShell>
  );
}
