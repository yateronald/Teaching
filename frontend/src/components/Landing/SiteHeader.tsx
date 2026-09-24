import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CloseOutlined, GlobalOutlined, MenuOutlined, RightOutlined } from '@ant-design/icons';
import { ASSET_PATHS } from '../../utils/assets';
import { LANDING, PATHS, type Lang } from './landingContent';

// Sections of the home page, in the order of the navigation.
export const SECTIONS = ['programs', 'method', 'simulator', 'platform', 'reviews', 'faq'] as const;

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
  const headerRef = useRef<HTMLElement | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuTop, setMenuTop] = useState(72);

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

  return (
    <>
      <header ref={headerRef} className={`lp-header${scrolled ? ' is-scrolled' : ''}${menuOpen ? ' is-open' : ''}`}>
        <div className="lp-wrap lp-header-row">
          <Link to={PATHS[lang]} className="lp-brand" aria-label="Learn French with Natives">
            <img src={ASSET_PATHS.LOGOS.MAIN} alt="" width="40" height="40" />
            <span><strong>Learn French</strong><em>with Natives</em></span>
          </Link>
          <nav className="lp-nav" aria-label="Main">
            {navItems.map(n => <a key={n.id} href={n.href} className={active === n.id ? 'is-active' : ''}>{n.label}</a>)}
          </nav>
          <div className="lp-header-end">
            {langSwitch}
            <a href="/login" className="lp-signin">{c.nav.signIn}</a>
            <button type="button" className="lp-btn lp-btn-primary lp-btn-sm" onClick={demo}>{c.nav.demo}</button>
            <button type="button" className="lp-burger" onClick={() => setMenuOpen(o => !o)} aria-expanded={menuOpen} aria-controls="lp-mobile-menu" aria-label={menuOpen ? c.nav.close : c.nav.menu}>
              {menuOpen ? <CloseOutlined /> : <MenuOutlined />}
            </button>
          </div>
        </div>
      </header>

      <div id="lp-mobile-menu" className="lp-mobile" hidden={!menuOpen} style={{ '--lp-menu-top': `${menuTop}px` } as React.CSSProperties}>
        <nav aria-label="Mobile">
          {navItems.map(n => <a key={n.id} href={n.href} onClick={() => setMenuOpen(false)}>{n.label}<RightOutlined /></a>)}
        </nav>
        <div className="lp-mobile-foot">
          {langSwitch}
          <a href="/login" className="lp-btn lp-btn-ghost">{c.nav.signIn}</a>
          <button type="button" className="lp-btn lp-btn-primary" onClick={demo}>{c.nav.demo}</button>
        </div>
      </div>
    </>
  );
};

export default SiteHeader;
