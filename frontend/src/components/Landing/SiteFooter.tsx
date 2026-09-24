import React from 'react';
import { Link } from 'react-router-dom';
import { MailOutlined } from '@ant-design/icons';
import { BRAND_LOGO, CONTACT_EMAIL, LANDING, PATHS, type Lang } from './landingContent';
import { TOPIC_PATHS, type TopicId } from './sitePages';
import { TOPICS } from './topicContent';

const COURSE_TOPICS: TopicId[] = ['online', 'business', 'kids'];

interface Props {
  lang: Lang;
  /** Prefix of the section links: '' on the home page, the home path elsewhere. */
  sectionBase?: string;
  onDemo: () => void;
}

/**
 * Footer shared by every public page. Its links to the exam and course pages
 * are how visitors and search engines find those pages from anywhere on the site.
 */
const SiteFooter: React.FC<Props> = ({ lang, sectionBase = '', onDemo }) => {
  const f = LANDING[lang].footer;
  const href = (h: string) => (h.startsWith('#') ? `${sectionBase}${h}` : h);
  return (
    <footer className="lp-footer">
      <div className="lp-wrap">
        <div className="lp-footer-grid">
          <div className="lp-footer-brand">
            <Link to={PATHS[lang]} className="lp-brand is-light" aria-label="Learn French with Natives">
              <img src={BRAND_LOGO} alt="" width="40" height="40" loading="lazy" />
              <span><strong>Learn French</strong><em>with Natives</em></span>
            </Link>
            <p>{f.tagline}</p>
            <a href={`mailto:${CONTACT_EMAIL}`} className="lp-footer-mail"><MailOutlined /><span><small>{f.contactLabel}</small>{CONTACT_EMAIL}</span></a>
          </div>
          <nav aria-label={f.exams}>
            <p className="lp-footer-title">{f.exams}</p>
            <ul>{f.examLinks.map(x => <li key={x.topic}><Link to={TOPIC_PATHS[x.topic][lang]}>{x.label}</Link></li>)}</ul>
          </nav>
          <nav aria-label={f.courses}>
            <p className="lp-footer-title">{f.courses}</p>
            <ul>
              {COURSE_TOPICS.map(id => <li key={id}><Link to={TOPIC_PATHS[id][lang]}>{TOPICS[lang][id].name}</Link></li>)}
              {f.courseLinks.map(x => <li key={x.label}><a href={href(x.href)}>{x.label}</a></li>)}
            </ul>
          </nav>
          <nav aria-label={f.company}>
            <p className="lp-footer-title">{f.company}</p>
            <ul>
              {f.companyLinks.map(x => (
                <li key={x.label}>{x.demo ? <button type="button" onClick={onDemo}>{x.label}</button> : <a href={href(x.href)}>{x.label}</a>}</li>
              ))}
            </ul>
            <p className="lp-footer-title is-spaced">{f.languages}</p>
            <ul className="lp-footer-langs">
              <li><Link to={PATHS.en} hrefLang="en" lang="en">English</Link></li>
              <li><Link to={PATHS.fr} hrefLang="fr" lang="fr">Français</Link></li>
            </ul>
          </nav>
        </div>
        <div className="lp-footer-bottom">
          <p>© {new Date().getFullYear()} Learn French with Natives · {f.rights}</p>
          <p>{f.made}</p>
        </div>
      </div>
      <div className="lp-tricolore" aria-hidden><i /><i /><i /></div>
    </footer>
  );
};

export default SiteFooter;
