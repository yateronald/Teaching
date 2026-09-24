import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRightOutlined, HomeOutlined } from '@ant-design/icons';
import SEO from '../SEO/SEO';
import { PATHS, type Lang } from './landingContent';
import { TOPIC_IDS, TOPIC_PATHS } from './sitePages';
import { TOPICS, TOPIC_UI } from './topicContent';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import { useDemoModal, usePublicPage } from './publicPage';
import './LandingPage.css';
import './TopicPage.css';

// ============================================================
// "Page not found" for any address that is not a page of the site. The server
// sends it with a real 404 status (dist/404.html, see deploy/serve-real-404.sh),
// so search engines drop wrong addresses instead of indexing copies of the home
// page. It points the visitor to the pages that do exist.
// ============================================================

const COPY: Record<Lang, { title: string; heading: string; text: string; home: string; popular: string }> = {
  en: {
    title: 'Page not found | Learn French with Natives',
    heading: 'This page does not exist.',
    text: 'The address may be mistyped, or the page may have moved. Here is where you can go instead.',
    home: 'Back to the home page',
    popular: 'Popular pages',
  },
  fr: {
    title: 'Page introuvable | Learn French with Natives',
    heading: 'Cette page n’existe pas.',
    text: 'L’adresse est peut-être mal saisie, ou la page a été déplacée. Voici où aller à la place.',
    home: 'Retour à l’accueil',
    popular: 'Pages les plus consultées',
  },
};

const NotFound: React.FC<{ lang?: Lang }> = ({ lang: forced }) => {
  const { pathname } = useLocation();
  const lang: Lang = forced ?? (/^\/fr(\/|$)/.test(pathname) ? 'fr' : 'en');
  const c = COPY[lang];
  const { openDemo, modal } = useDemoModal();
  usePublicPage(lang);

  return (
    <div className="lp tp" lang={lang}>
      <SEO lang={lang} title={c.title} description={c.text} path={pathname} noindex />
      <SiteHeader lang={lang} alternates={PATHS} sectionBase={PATHS[lang]} onDemo={openDemo} />

      <main id="main">
        <section className="nf-hero" aria-labelledby="nf-title">
          <div className="lp-hero-bg" aria-hidden />
          <div className="lp-wrap nf-inner">
            <p className="nf-code" aria-hidden>404</p>
            <h1 id="nf-title">{c.heading}</h1>
            <p className="nf-text">{c.text}</p>
            <div className="lp-hero-ctas nf-ctas">
              <Link to={PATHS[lang]} className="lp-btn lp-btn-primary lp-btn-lg"><HomeOutlined />{c.home}</Link>
              <button type="button" className="lp-btn lp-btn-ghost lp-btn-lg" onClick={openDemo}>{TOPIC_UI[lang].demo}<ArrowRightOutlined /></button>
            </div>
          </div>
        </section>

        <section className="lp-section tp-section lp-tint" aria-labelledby="nf-popular">
          <div className="lp-wrap">
            <header className="lp-head">
              <h2 id="nf-popular">{c.popular}</h2>
            </header>
            <ul className="tp-related nf-pages">
              {TOPIC_IDS.map(id => (
                <li key={id}>
                  <Link to={TOPIC_PATHS[id][lang]} className="tp-related-card">
                    <h3>{TOPICS[lang][id].name}</h3>
                    <p>{TOPICS[lang][id].card}</p>
                    <span>{TOPIC_UI[lang].learnMore}<ArrowRightOutlined aria-hidden /></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <SiteFooter lang={lang} sectionBase={PATHS[lang]} onDemo={openDemo} />
      {modal}
    </div>
  );
};

export default NotFound;
