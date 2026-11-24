import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarOutlined, CloseOutlined, CrownOutlined, ExportOutlined, GlobalOutlined, LogoutOutlined,
  MenuOutlined, RightOutlined, UserOutlined,
} from '@ant-design/icons';
import { BRAND_LOGO, LANDING, PATHS, type Lang } from './landingContent';
import { LEARN_HOME } from '../../learn/entry';
import { UserMenu } from '../../learn/account/UserMenu';
import { resolveUserBadge } from '../../learn/account/identity';
import { accountPath } from '../../learn/account/paths';
import { freeForAllCopy, loadAccount, signOut, startAccessWatcher, useAccount } from '../../learn/account/store';

const LEARN_LABEL: Record<Lang, string> = { en: 'Free courses', fr: 'Cours gratuits' };
const LEARN_ONLINE_LABEL: Record<Lang, string> = { en: 'Online courses', fr: 'Cours en ligne' };

// Sections of the home page, in the order of the navigation.
export const SECTIONS = ['programs', 'simulator', 'pricing', 'platform', 'reviews', 'faq'] as const;

interface Props {
  lang: Lang;
  /** This page in each language, for the language switch. */
  alternates: Record<Lang, string>;
  /** Prefix of the section links: '' on the home page, the home path elsewhere. */
  sectionBase?: string;
  /** Section currently on screen (home page only). */
  active?: string;
  onDemo: () => void;
}

/** Header and mobile menu shared by every public page. */
const SiteHeader: React.FC<Props> = ({ lang, alternates, sectionBase = '', active = '', onDemo }) => {
  const c = LANDING[lang];
  const account = useAccount();
  const identity = resolveUserBadge(account, lang);
  const learnLabel = freeForAllCopy(account) ? LEARN_LABEL[lang] : LEARN_ONLINE_LABEL[lang];
  const headerRef = useRef<HTMLElement | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuTop, setMenuTop] = useState(72);

  useEffect(() => {
    void loadAccount();
    startAccessWatcher();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // The mobile menu opens right under the header, wherever the header is.
  useEffect(() => {
    if (!menuOpen) return;
    const place = () => setMenuTop(Math.round(headerRef.current?.getBoundingClientRect().bottom ?? 72));
    place();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [menuOpen, scrolled]);

  // Mobile menu: Escape closes it, the page behind does not scroll.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [menuOpen]);

  const demo = () => { setMenuOpen(false); onDemo(); };
  const learnActive = typeof alternates[lang] === 'string' && alternates[lang].startsWith(LEARN_HOME[lang]);
  const navItems = SECTIONS.map(id => ({ id, label: c.nav[id], href: `${sectionBase}#${id}` }));
  const langSwitch = (
    <div className="lp-lang" role="group" aria-label={c.nav.language}>
      <GlobalOutlined aria-hidden />
      {(['en', 'fr'] as Lang[]).map(l => (
        <Link key={l} to={alternates[l]} hrefLang={l} lang={l} className={l === lang ? 'is-current' : ''} aria-current={l === lang ? 'page' : undefined}>
          {l.toUpperCase()}
        </Link>
      ))}
    </div>
  );

  const mobileAccount = () => {
    if (!identity) {
      return <a href="/login" className="lp-btn lp-btn-ghost">{c.nav.signIn}</a>;
    }
    const person = account.user ?? account.portalUser;
    const profLabel = lang === 'fr' ? 'Profil' : 'Profile';
    const subLabel = lang === 'fr' ? 'Abonnement' : 'Subscription';
    const portalLabel = lang === 'fr' ? `Portail ${identity.badge}` : `${identity.badge} portal`;
    const signOutLabel = lang === 'fr' ? 'Déconnexion' : 'Log out';
    return (
      <div className="lp-mobile-account">
        <div className="lp-mobile-account-head">
          <span className={`lp-user-ava is-${identity.variant}`} aria-hidden>{identity.initial}</span>
          <div className="lp-mobile-account-id">
            <strong>{identity.fullName}</strong>
            {person?.email && <small>{person.email}</small>}
          </div>
          <span className={`lp-user-role is-${identity.variant}`}>{identity.badge}</span>
        </div>
        <div className="lp-mobile-account-actions">
          {account.user ? (
            <Link to={accountPath('account', lang)} className="lp-btn lp-btn-ghost" onClick={() => setMenuOpen(false)}>
              <UserOutlined aria-hidden /> {profLabel}
            </Link>
          ) : (
            <a href={identity.href} className="lp-btn lp-btn-ghost" onClick={() => setMenuOpen(false)}>
              <UserOutlined aria-hidden /> {profLabel}
            </a>
          )}
          <Link to={accountPath('subscription', lang)} className="lp-btn lp-btn-ghost" onClick={() => setMenuOpen(false)}>
            <CrownOutlined aria-hidden /> {subLabel}
          </Link>
          {identity.external && (
            <a href={identity.href} className="lp-btn lp-btn-ghost" onClick={() => setMenuOpen(false)}>
              <ExportOutlined aria-hidden /> {portalLabel}
            </a>
          )}
          <button
            type="button"
            className="lp-btn lp-btn-ghost lp-mobile-signout"
            onClick={() => {
              setMenuOpen(false);
              void signOut(false);
            }}
          >
            <LogoutOutlined aria-hidden /> {signOutLabel}
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <header ref={headerRef} className={`lp-header${scrolled ? ' is-scrolled' : ''}${menuOpen ? ' is-open' : ''}`}>
        <div className="lp-wrap lp-header-row">
          <Link to={PATHS[lang]} className="lp-brand" aria-label="Learn French with Natives">
            <img src={BRAND_LOGO} alt="" width="40" height="40" />
            <span><strong>Learn French</strong><em>with Natives</em></span>
          </Link>
          <nav className="lp-nav" aria-label="Main">
            {navItems.map(n => <a key={n.id} href={n.href} className={active === n.id ? 'is-active' : ''}>{n.label}</a>)}
            <Link to={LEARN_HOME[lang]} className={`lp-nav-learn${learnActive ? ' is-active' : ''}`}>{learnLabel}</Link>
          </nav>
          <div className="lp-header-end">
            {langSwitch}
            {identity ? <UserMenu lang={lang} variant="header" /> : <a href="/login" className="lp-signin">{c.nav.signIn}</a>}
            <button type="button" className="lp-btn lp-btn-demo lp-btn-sm" onClick={demo} aria-label={c.nav.demo}>
              <CalendarOutlined aria-hidden />
              <span className="lp-demo-full">{c.nav.demo}</span>
              <span className="lp-demo-short">{c.nav.demoShort}</span>
            </button>
            <button type="button" className="lp-burger" onClick={() => setMenuOpen(o => !o)} aria-expanded={menuOpen} aria-controls="lp-mobile-menu" aria-label={menuOpen ? c.nav.close : c.nav.menu}>
              {menuOpen ? <CloseOutlined /> : <MenuOutlined />}
            </button>
          </div>
        </div>
      </header>

      <div id="lp-mobile-menu" className="lp-mobile" hidden={!menuOpen} style={{ '--lp-menu-top': `${menuTop}px` } as React.CSSProperties}>
        <nav aria-label="Mobile">
          {navItems.map(n => <a key={n.id} href={n.href} onClick={() => setMenuOpen(false)}>{n.label}<RightOutlined /></a>)}
          <Link to={LEARN_HOME[lang]} onClick={() => setMenuOpen(false)} className="lp-mobile-learn">{learnLabel}<RightOutlined /></Link>
        </nav>
        <div className="lp-mobile-foot">
          {langSwitch}
          {mobileAccount()}
          <button type="button" className="lp-btn lp-btn-demo" onClick={demo}><CalendarOutlined aria-hidden /> {c.nav.demo}</button>
        </div>
      </div>
    </>
  );
};

export default SiteHeader;
