// The Privacy Policy and the Terms of Service (one page each, in English and
// French), with the site's header and footer and a table of contents.
import { Fragment, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { RightOutlined } from '@ant-design/icons';
import SEO from '../components/SEO/SEO';
import SiteHeader from '../components/Landing/SiteHeader';
import SiteFooter from '../components/Landing/SiteFooter';
import { PATHS, type Lang } from '../components/Landing/landingContent';
import { useDemoModal, usePublicPage } from '../components/Landing/publicPage';
import { LEGAL, type Block, type LegalKind } from './content';
import { LEGAL_PATHS } from './paths';
import '../components/Landing/LandingPage.css';
import '../components/Landing/TopicPage.css';
import './legal.css';

/** Text with [label](href) links: pages of the site through the router, the rest as plain links. */
function Inline({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const [, label, href] = m;
    parts.push(href.startsWith('/')
      ? <Link key={m.index} to={href}>{label}</Link>
      : <a key={m.index} href={href} {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{label}</a>);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts.map((p, i) => <Fragment key={i}>{p}</Fragment>)}</>;
}

function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) => (Array.isArray(b)
        ? <ul key={i}>{b.map((li, j) => <li key={j}><Inline text={li} /></li>)}</ul>
        : <p key={i}><Inline text={b} /></p>))}
    </>
  );
}

export default function LegalPage({ kind, lang }: { kind: LegalKind; lang: Lang }) {
  const doc = LEGAL[kind][lang];
  const alternates = LEGAL_PATHS[kind];
  const other = kind === 'privacy' ? 'terms' : 'privacy';
  const { openDemo, modal } = useDemoModal();
  usePublicPage(lang);
  const fr = lang === 'fr';
  return (
    <div className="lp tp" lang={lang}>
      <SEO lang={lang} title={`${doc.title} | Learn French with Natives`} description={doc.metaDescription} path={alternates[lang]} alternates={alternates} />
      <a href="#main" className="lp-skip">{fr ? 'Aller au contenu' : 'Skip to content'}</a>
      <SiteHeader lang={lang} alternates={alternates} sectionBase={PATHS[lang]} onDemo={openDemo} />

      <main id="main" className="lg">
        <section className="tp-hero lg-hero" aria-labelledby="lg-title">
          <div className="lp-wrap">
            <nav className="tp-crumbs" aria-label={fr ? 'Fil d’Ariane' : 'Breadcrumb'}>
              <ol>
                <li><Link to={PATHS[lang]}>{fr ? 'Accueil' : 'Home'}</Link><RightOutlined aria-hidden /></li>
                <li aria-current="page">{doc.title}</li>
              </ol>
            </nav>
            <h1 id="lg-title">{doc.title}</h1>
            <p className="lg-updated">{doc.updated}</p>
          </div>
        </section>

        <div className="lp-wrap lg-layout">
          <nav className="lg-toc" aria-label={fr ? 'Sommaire' : 'Contents'}>
            <p className="lg-toc-k">{fr ? 'Sommaire' : 'Contents'}</p>
            <ol>{doc.sections.map(s => <li key={s.id}><a href={`#${s.id}`}>{s.title.replace(/^\d+\.\s*/, '')}</a></li>)}</ol>
            <p className="lg-toc-other"><Link to={LEGAL_PATHS[other][lang]}>{LEGAL[other][lang].title}</Link></p>
          </nav>
          <article className="lg-doc">
            <div className="lg-intro"><Blocks blocks={doc.intro} /></div>
            {doc.sections.map(s => (
              <section key={s.id} id={s.id} aria-labelledby={`lg-${s.id}`}>
                <h2 id={`lg-${s.id}`}>{s.title}</h2>
                <Blocks blocks={s.blocks} />
              </section>
            ))}
          </article>
        </div>
      </main>

      <SiteFooter lang={lang} sectionBase={PATHS[lang]} onDemo={openDemo} />
      {modal}
    </div>
  );
}
