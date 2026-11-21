import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightOutlined, AudioOutlined, CheckOutlined, CustomerServiceOutlined, SafetyCertificateOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { CATEGORIES, LEARN_BASE, categoryPath, imageUrl } from '../../learn/categories';
import { tx } from '../../learn/types';
import type { Lang } from './landingContent';

// The home page section that opens the free courses (/learn/, /fr/apprendre/).
const COPY = {
  en: {
    eyebrow: 'Free French academy',
    title: 'Start learning now, 100% free',
    sub: 'More than 270 interactive courses, 221 reading & listening activities and 5 French games designed by our teaching team, from your first words to C2 in TCF and TEF Canada. No account needed.',
    points: ['Native French audio', '221 practice drills', 'Certificates of completion'],
    all: 'Explore free courses',
    test: 'Free 10-min level test',
    practiceLabel: 'Reading & Listening Studio',
    studioCardKicker: 'All 11 paths · A1–C2',
    studioCardTitle: 'Explore 270+ free courses & 221 practice drills',
    studioCardCta: 'Open free academy',
    allPathsLabel: 'All 11 learning paths:',
  },
  fr: {
    eyebrow: 'Espace gratuit',
    title: 'Commencez à apprendre maintenant, 100 % gratuit',
    sub: 'Plus de 270 cours interactifs, 221 activités d’écoute et de lecture et 5 jeux conçus par notre équipe pédagogique, de vos premiers mots jusqu’au C2 du TCF et du TEF Canada. Sans inscription.',
    points: ['Audio en français natif', '221 activités pratiques', 'Certificats de réussite'],
    all: 'Explorer les cours gratuits',
    test: 'Test de niveau gratuit (10 min)',
    practiceLabel: 'Atelier d’écoute & lecture',
    studioCardKicker: '11 parcours · A1–C2',
    studioCardTitle: 'Explorer plus de 270 cours gratuits et 221 exercices',
    studioCardCta: 'Ouvrir l’espace gratuit',
    allPathsLabel: 'Les 11 parcours gratuits :',
  },
};
const POINT_ICONS = [<AudioOutlined />, <CustomerServiceOutlined />, <SafetyCertificateOutlined />];
const PLACEMENT: Record<Lang, string> = { en: '/learn/french-level-test/', fr: '/fr/apprendre/test-de-niveau/' };
const FEATURED_IDS = ['beginner', 'tcf', 'tef-quebec', 'delf-dalf', 'listening', 'reading', 'grammar'];

const LearnTeaser: React.FC<{ lang: Lang }> = ({ lang }) => {
  const c = COPY[lang];
  const featured = FEATURED_IDS
    .map(id => CATEGORIES.find(cat => cat.id === id))
    .filter((cat): cat is (typeof CATEGORIES)[number] => Boolean(cat));

  return (
    <section id="learn" className="lp-section lp-learn" aria-labelledby="lp-learn-title">
      <div className="lp-wrap">
        <div className="lp-learn-head" data-reveal>
          <div>
            <p className="lp-eyebrow">{c.eyebrow}</p>
            <h2 id="lp-learn-title">{c.title}</h2>
            <p>{c.sub}</p>
            <ul>{c.points.map((p, i) => <li key={p}><span aria-hidden>{POINT_ICONS[i]}</span>{p}</li>)}</ul>
          </div>
          <div className="lp-learn-ctas">
            <Link to={LEARN_BASE[lang]} className="lp-btn lp-btn-primary">{c.all}<ArrowRightOutlined /></Link>
            <Link to={PLACEMENT[lang]} className="lp-btn lp-btn-ghost"><ThunderboltOutlined />{c.test}</Link>
          </div>
        </div>

        {/* Balanced 4x2 visual grid (7 flagship paths + 1 dark-navy academy spotlight tile — zero orphans) */}
        <ul className="lp-learn-grid" data-reveal data-stagger>
          {featured.map(cat => (
            <li key={cat.id}>
              <Link to={categoryPath(cat, lang)} className="lp-learn-tile">
                <img src={imageUrl(cat.image, 640)} alt="" loading="lazy" decoding="async" width="640" height="360" />
                <span className="lp-learn-tile-body">
                  <strong>{tx(cat.name, lang)}</strong>
                  <em>{tx(cat.tag, lang)}</em>
                </span>
                <ArrowRightOutlined className="lp-learn-arrow" aria-hidden />
              </Link>
            </li>
          ))}
          <li>
            <Link to={LEARN_BASE[lang]} className="lp-learn-tile is-all">
              <span className="lp-learn-all-flag" aria-hidden><i /><i /><i /></span>
              <span className="lp-learn-all-k">{c.studioCardKicker}</span>
              <strong>{c.studioCardTitle}</strong>
              <span className="lp-learn-all-go">{c.studioCardCta} <ArrowRightOutlined aria-hidden /></span>
            </Link>
          </li>
        </ul>

        {/* Complete SEO & quick-jump strip covering all 11 paths */}
        <nav className="lp-learn-pills" aria-label={c.allPathsLabel} data-reveal>
          <span><CheckOutlined aria-hidden /> {c.allPathsLabel}</span>
          {CATEGORIES.map(cat => (
            <Link key={cat.id} to={categoryPath(cat, lang)}>{tx(cat.name, lang)}</Link>
          ))}
        </nav>
      </div>
    </section>
  );
};

export default LearnTeaser;
