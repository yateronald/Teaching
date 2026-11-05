import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightOutlined, AudioOutlined, CheckOutlined, SafetyCertificateOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { CATEGORIES, LEARN_BASE, categoryPath, imageUrl } from '../../learn/categories';
import { tx } from '../../learn/types';
import type { Lang } from './landingContent';

// The home page section that opens the free courses (/learn/, /fr/apprendre/).
const COPY = {
  en: {
    eyebrow: 'Free courses',
    title: 'Start learning now, for free',
    sub: '57 interactive courses written by our teachers, from your first words to C2 in TCF and TEF Canada: native audio, speaking practice, instant feedback and certificates. No account needed.',
    points: ['Native French audio', 'Speak and get feedback', 'Certificates of completion'],
    all: 'See the 57 courses',
    test: 'Free level test',
  },
  fr: {
    eyebrow: 'Cours gratuits',
    title: 'Commencez à apprendre maintenant, gratuitement',
    sub: '57 cours interactifs écrits par nos professeurs, de vos premiers mots jusqu’au C2 du TCF et du TEF Canada : audio natif, pratique de l’oral, correction immédiate et certificats. Sans compte.',
    points: ['Audio en français natif', 'Parlez et recevez un retour', 'Certificats de réussite'],
    all: 'Voir les 57 cours',
    test: 'Test de niveau gratuit',
  },
};
const POINT_ICONS = [<AudioOutlined />, <ThunderboltOutlined />, <SafetyCertificateOutlined />];
const PLACEMENT: Record<Lang, string> = { en: '/learn/french-level-test/', fr: '/fr/apprendre/test-de-niveau/' };

const LearnTeaser: React.FC<{ lang: Lang }> = ({ lang }) => {
  const c = COPY[lang];
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
            <Link to={LEARN_BASE[lang]} className="lp-btn lp-btn-primary lp-btn-lg">{c.all}<ArrowRightOutlined /></Link>
            <Link to={PLACEMENT[lang]} className="lp-btn lp-btn-ghost lp-btn-lg"><CheckOutlined />{c.test}</Link>
          </div>
        </div>
        <ul className="lp-learn-grid" data-reveal>
          {CATEGORIES.map(cat => (
            <li key={cat.id}>
              <Link to={categoryPath(cat, lang)} className="lp-learn-tile">
                <img src={imageUrl(cat.image, 640)} alt="" loading="lazy" width="640" height="360" />
                <span className="lp-learn-tile-body">
                  <strong>{tx(cat.name, lang)}</strong>
                  <em>{tx(cat.tag, lang)}</em>
                </span>
                <ArrowRightOutlined className="lp-learn-arrow" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default LearnTeaser;
