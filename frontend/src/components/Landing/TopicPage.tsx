import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRightOutlined, AudioOutlined, CheckOutlined, EditOutlined, FileTextOutlined,
  MailOutlined, RightOutlined, SafetyCertificateOutlined, TeamOutlined,
} from '@ant-design/icons';
import SEO from '../SEO/SEO';
import { CONTACT_EMAIL, LANDING, PATHS, QUOTES, type Lang } from './landingContent';
import { topicJsonLd } from './landingSchema';
import { TOPIC_PATHS, type TopicId } from './sitePages';
import { TOPICS, TOPIC_UI } from './topicContent';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import { useDemoModal, usePublicPage } from './publicPage';
import './LandingPage.css';
import './TopicPage.css';

// ============================================================
// One page per exam or kind of course (/tcf-canada-preparation/, …), each in
// English and French. Pre-rendered at build time like the home page, so the
// whole text is in the HTML search engines download.
// ============================================================

const METHOD_ICONS = [<SafetyCertificateOutlined />, <TeamOutlined />, <AudioOutlined />, <EditOutlined />];

interface Props { topic: TopicId; lang?: Lang }

const TopicPage: React.FC<Props> = ({ topic, lang = 'en' }) => {
  const t = TOPICS[lang][topic];
  const ui = TOPIC_UI[lang];
  const home = LANDING[lang];
  const { openDemo, modal } = useDemoModal();
  usePublicPage(lang);
  const quote = t.quote === undefined ? null : QUOTES[t.quote];
  const topicLink = (id: TopicId) => <Link key={id} to={TOPIC_PATHS[id][lang]}>{TOPICS[lang][id].name}</Link>;

  return (
    <div className="lp tp" lang={lang}>
      <SEO
        lang={lang}
        title={t.meta.title}
        description={t.meta.description}
        path={TOPIC_PATHS[topic][lang]}
        imageAlt={home.meta.ogAlt}
        alternates={TOPIC_PATHS[topic]}
        jsonLd={topicJsonLd(topic, lang)}
      />
      <a href="#main" className="lp-skip">{home.skip}</a>

      <SiteHeader lang={lang} alternates={TOPIC_PATHS[topic]} sectionBase={PATHS[lang]} onDemo={openDemo} />

      <main id="main">
        {/* ── Hero ── */}
        <section className="tp-hero" aria-labelledby="tp-title">
          <div className="lp-hero-bg" aria-hidden />
          <div className="lp-wrap tp-hero-grid">
            <div className="tp-hero-copy">
              <nav className="tp-crumbs" aria-label={ui.breadcrumb}>
                <ol>
                  <li><Link to={PATHS[lang]}>{ui.home}</Link><RightOutlined aria-hidden /></li>
                  <li aria-current="page">{t.name}</li>
                </ol>
              </nav>
              <p className="lp-eyebrow">{t.eyebrow}</p>
              <h1 id="tp-title">{t.h1[0]} <em>{t.h1[1]}</em></h1>
              <p className="tp-intro">{t.intro}</p>
              <div className="lp-hero-ctas">
                <button type="button" className="lp-btn lp-btn-primary lp-btn-lg" onClick={openDemo}>{ui.demo}<ArrowRightOutlined /></button>
                <a href={`#${t.tables[0].id}`} className="lp-btn lp-btn-ghost lp-btn-lg"><FileTextOutlined />{t.ctaSecondary}</a>
              </div>
              <ul className="tp-highlights">
                {t.highlights.map(h => <li key={h}><CheckOutlined aria-hidden />{h}</li>)}
              </ul>
            </div>
            <aside className="tp-glance" aria-labelledby="tp-glance-title">
              <p id="tp-glance-title" className="tp-glance-title">{ui.atGlance}</p>
              <dl>
                {t.facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
              </dl>
              <button type="button" className="lp-btn lp-btn-primary" onClick={openDemo}>{ui.demo}<ArrowRightOutlined /></button>
            </aside>
          </div>
        </section>

        {/* ── Formats, levels, score charts ── */}
        {t.tables.map((table, i) => (
          <section key={table.id} id={table.id} className={`lp-section tp-section${i % 2 === 0 ? ' lp-tint' : ''}`} aria-labelledby={`tp-${table.id}-title`}>
            <div className="lp-wrap">
              <header className="lp-head">
                <p className="lp-eyebrow">{table.eyebrow}</p>
                <h2 id={`tp-${table.id}-title`}>{table.title}</h2>
                <p>{table.sub}</p>
              </header>
              <div className="tp-table-wrap">
                <table className={`tp-table is-${table.cols.length}`}>
                  <thead>
                    <tr>{table.cols.map(col => <th key={col} scope="col">{col}</th>)}</tr>
                  </thead>
                  <tbody>
                    {table.rows.map(row => (
                      <tr key={row[0]}>
                        {row.map((cell, k) => (k === 0
                          ? <th key={k} scope="row">{cell}</th>
                          : <td key={k} data-label={table.cols[k]}>{cell}</td>))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {table.note && <p className="tp-note">{table.note}</p>}
            </div>
          </section>
        ))}

        {/* ── Guide ── */}
        <section id="guide" className="lp-section tp-section" aria-label={ui.guideEyebrow}>
          <div className="lp-wrap tp-guide">
            <div className="tp-article">
              {t.guide.map(g => (
                <article key={g.title}>
                  <h2>{g.title}</h2>
                  {g.paragraphs.map(p => <p key={p.slice(0, 40)}>{p}</p>)}
                  {g.links && (
                    <p className="tp-readmore">
                      <span>{ui.readMore}</span>
                      {g.links.map(topicLink)}
                    </p>
                  )}
                </article>
              ))}
            </div>
            <aside className="tp-aside">
              <div className="tp-aside-card">
                <p className="tp-aside-title">{ui.asideTitle}</p>
                <ul>{ui.asideItems.map(x => <li key={x}><CheckOutlined aria-hidden />{x}</li>)}</ul>
                <button type="button" className="lp-btn lp-btn-primary" onClick={openDemo}>{ui.demo}<ArrowRightOutlined /></button>
                <a href={`mailto:${CONTACT_EMAIL}`} className="tp-aside-mail"><MailOutlined /> {CONTACT_EMAIL}</a>
              </div>
            </aside>
          </div>
        </section>

        {/* ── Method ── */}
        <section id="method" className="lp-section tp-section lp-tint" aria-labelledby="tp-method-title">
          <div className="lp-wrap">
            <header className="lp-head">
              <p className="lp-eyebrow">{ui.methodEyebrow}</p>
              <h2 id="tp-method-title">{t.method.title}</h2>
              <p>{t.method.sub}</p>
            </header>
            <ol className="tp-cards">
              {t.method.items.map((m, i) => (
                <li key={m.title} className="tp-card">
                  <span className="tp-card-icon" aria-hidden>{METHOD_ICONS[i % METHOD_ICONS.length]}</span>
                  <h3>{m.title}</h3>
                  <p>{m.desc}</p>
                </li>
              ))}
            </ol>
            {quote && (
              <figure className="tp-quote">
                <blockquote>“{quote.text}”</blockquote>
                <figcaption>
                  <span className="lp-avatar" aria-hidden>{quote.name.charAt(0)}</span>
                  <span><strong>{quote.name}</strong><em>{quote.role}</em></span>
                  <b>{ui.quoteLabel}</b>
                </figcaption>
              </figure>
            )}
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="lp-section tp-section" aria-labelledby="tp-faq-title">
          <div className="lp-wrap lp-faq-grid">
            <header className="lp-head is-left">
              <p className="lp-eyebrow">{ui.faqEyebrow}</p>
              <h2 id="tp-faq-title">{t.faqTitle}</h2>
              <a href={`mailto:${CONTACT_EMAIL}`} className="lp-faq-mail"><MailOutlined /> {home.faq.more}</a>
            </header>
            <div className="lp-faq-list">
              {t.faq.map((item, i) => (
                <details key={item.q} className="lp-faq-item" open={i === 0 || undefined}>
                  <summary><h3>{item.q}</h3><span className="lp-faq-icon" aria-hidden /></summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── Other pages ── */}
        <section className="lp-section tp-section lp-tint" aria-labelledby="tp-related-title">
          <div className="lp-wrap">
            <header className="lp-head">
              <p className="lp-eyebrow">{ui.relatedEyebrow}</p>
              <h2 id="tp-related-title">{ui.relatedTitle}</h2>
            </header>
            <ul className="tp-related">
              {t.related.map(id => (
                <li key={id}>
                  <Link to={TOPIC_PATHS[id][lang]} className="tp-related-card">
                    <h3>{TOPICS[lang][id].name}</h3>
                    <p>{TOPICS[lang][id].card}</p>
                    <span>{ui.learnMore}<ArrowRightOutlined aria-hidden /></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Final call to action ── */}
        <section className="lp-finale tp-finale" aria-labelledby="tp-finale-title">
          <div className="lp-wrap lp-finale-inner">
            <h2 id="tp-finale-title">{ui.finale.title}</h2>
            <p>{ui.finale.sub}</p>
            <div className="lp-finale-ctas">
              <button type="button" className="lp-btn lp-btn-light lp-btn-lg" onClick={openDemo}>{ui.demo}<ArrowRightOutlined /></button>
              <a href="/login" className="lp-finale-login">{home.finale.login}</a>
            </div>
            <p className="lp-finale-trust"><SafetyCertificateOutlined /> {home.finale.trust}</p>
          </div>
        </section>
      </main>

      <SiteFooter lang={lang} sectionBase={PATHS[lang]} onDemo={openDemo} />

      {modal}
    </div>
  );
};

export default TopicPage;
