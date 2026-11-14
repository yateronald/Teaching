// The offers page (/offers/, /fr/offres/): every campaign that is live, the
// most important first. The address every flyer and shared link leads to:
// /offers/?p=<slug> opens that campaign directly.
//
// Its frame (title, text, reasons to join) is pre-rendered like the other
// public pages; the campaigns themselves arrive from the server after it.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightOutlined, CalendarOutlined, RightOutlined, SafetyCertificateOutlined, TeamOutlined, VideoCameraOutlined } from '@ant-design/icons';
import SEO from '../components/SEO/SEO';
import SiteHeader from '../components/Landing/SiteHeader';
import SiteFooter from '../components/Landing/SiteFooter';
import { PATHS } from '../components/Landing/landingContent';
import { useDemoModal, usePublicPage } from '../components/Landing/publicPage';
import { LEARN_HOME } from '../learn/entry';
import { COPY } from './copy';
import { OFFERS_PATH, track, type Lang } from './model';
import { PromoCard } from './parts';
import { PromoBar } from './placements';
import { PromoProvider } from './PromoProvider';
import { usePromo } from './context';
import '../components/Landing/LandingPage.css';
import '../components/Landing/TopicPage.css';

const WHY_ICONS = [<VideoCameraOutlined />, <TeamOutlined />, <CalendarOutlined />, <SafetyCertificateOutlined />];

function Offers({ lang, onDemo }: { lang: Lang; onDemo: () => void }) {
  const { promos, loaded, open, registered } = usePromo();
  const c = COPY[lang].page;
  // A shared link to a campaign that has ended says so, instead of showing nothing.
  const [gone, setGone] = useState(false);
  useEffect(() => {
    if (!loaded) return;
    const slug = new URLSearchParams(window.location.search).get('p');
    setGone(!!slug && !promos.some(p => p.slug.toLowerCase() === slug.toLowerCase()));
    promos.forEach(p => track(p.slug, 'view', 'offers'));
  }, [loaded, promos]);

  if (!loaded) return <p className="pm-offers-loading" role="status">{c.loading}</p>;
  if (!promos.length) {
    return (
      <div className="pm-offers-empty">
        {gone && <p className="pm-offers-gone">{c.gone}</p>}
        <span className="pm-offers-empty-icon" aria-hidden><CalendarOutlined /></span>
        <h2>{c.emptyTitle}</h2>
        <p>{c.emptyText}</p>
        <div className="lp-hero-ctas">
          <button type="button" className="lp-btn lp-btn-primary lp-btn-lg" onClick={onDemo}>{c.emptyDemo}<ArrowRightOutlined /></button>
          <Link to={LEARN_HOME[lang]} className="lp-btn lp-btn-ghost lp-btn-lg">{c.emptyLearn}</Link>
        </div>
      </div>
    );
  }
  const [first, ...rest] = promos;
  return (
    <>
      {gone && <p className="pm-offers-gone">{c.gone}</p>}
      <PromoCard promo={first} lang={lang} variant="wide" registered={registered.includes(first.slug)} onOpen={p => open(p, 'offers')} />
      {rest.length > 0 && (
        <div className={`pm-grid is-${Math.min(3, rest.length)}`}>
          {rest.map(p => <PromoCard key={p.slug} promo={p} lang={lang} registered={registered.includes(p.slug)} onOpen={x => open(x, 'offers')} />)}
        </div>
      )}
    </>
  );
}

export default function OffersPage({ lang = 'en' }: { lang?: Lang }) {
  const c = COPY[lang].page;
  const { openDemo, modal } = useDemoModal();
  usePublicPage(lang);
  return (
    <PromoProvider lang={lang} area="offers">
      <div className="lp tp" lang={lang}>
        <SEO lang={lang} title={c.metaTitle} description={c.metaDescription} path={OFFERS_PATH[lang]} alternates={OFFERS_PATH} />
        <a href="#main" className="lp-skip">{lang === 'fr' ? 'Aller au contenu' : 'Skip to content'}</a>
        <PromoBar />
        <SiteHeader lang={lang} alternates={OFFERS_PATH} sectionBase={PATHS[lang]} onDemo={openDemo} />

        <main id="main">
          <section className="tp-hero pm-offers-hero" aria-labelledby="pm-offers-title">
            <div className="lp-hero-bg" aria-hidden />
            <div className="lp-wrap pm-offers-head">
              <nav className="tp-crumbs" aria-label={lang === 'fr' ? 'Fil d’Ariane' : 'Breadcrumb'}>
                <ol>
                  <li><Link to={PATHS[lang]}>{c.crumbHome}</Link><RightOutlined aria-hidden /></li>
                  <li aria-current="page">{c.crumb}</li>
                </ol>
              </nav>
              <p className="lp-eyebrow">{c.eyebrow}</p>
              <h1 id="pm-offers-title">{c.title}</h1>
              <p className="tp-intro">{c.sub}</p>
            </div>
          </section>

          <section className="pm-offers" aria-label={c.eyebrow}>
            <div className="lp-wrap pm-offers-list" aria-live="polite">
              <Offers lang={lang} onDemo={openDemo} />
            </div>
          </section>

          <section className="lp-section lp-tint" aria-labelledby="pm-why-title">
            <div className="lp-wrap">
              <h2 id="pm-why-title" className="pm-h2">{c.whyTitle}</h2>
              <ul className="pm-why">
                {c.why.map(([title, text], i) => (
                  <li key={title}><span aria-hidden>{WHY_ICONS[i]}</span><h3>{title}</h3><p>{text}</p></li>
                ))}
              </ul>
            </div>
          </section>
        </main>

        <SiteFooter lang={lang} sectionBase={PATHS[lang]} onDemo={openDemo} />
        {modal}
      </div>
    </PromoProvider>
  );
}
