// /learn/games/ and /fr/apprendre/jeux/: the five games.
import { Link } from 'react-router-dom';
import { ArrowRightOutlined, CheckOutlined, ClockCircleOutlined, CustomerServiceOutlined, EditOutlined, PlayCircleFilled, SafetyCertificateOutlined, TrophyOutlined } from '@ant-design/icons';
import { imageUrl } from '../categories';
import { G } from '../games/copy';
import { GameArt, Stars } from '../games/frame';
import { GAMES, gameById, gamePath, gamesPath, type GameMeta } from '../games/meta';
import { EPISODES } from '../games/story';
import { AUTOSTART, hubPath } from '../paths';
import { useProgress } from '../progress';
import { gameJsonLd } from '../schema';
import { Crumbs, LearnShell, useDemo, useMounted } from '../shell';
import { tx, type Lang } from '../types';
import { UI } from '../ui';

const WHY_ICONS = [<CustomerServiceOutlined />, <EditOutlined />, <SafetyCertificateOutlined />];

/** A game card: the whole card opens the game page, “Play” starts the game. */
export function GameCard({ game, lang, wide = false }: { game: GameMeta; lang: Lang; wide?: boolean }) {
  const g = G[lang];
  const p = useProgress();
  const mounted = useMounted();
  const best = mounted ? p.games?.[game.id]?.best : undefined;
  const stars = mounted && game.id === 'story' ? EPISODES.reduce((n, e) => n + (p.story?.[e.id] ?? 0), 0) : 0;
  return (
    <article className={`gx-gcard${wide ? ' is-wide' : ''}`}>
      <div className="gx-gcard-art">
        {game.id === 'story' ? <img src={imageUrl('story-airport', wide ? 1200 : 640)} alt="" loading="lazy" width="640" height="360" /> : <GameArt id={game.id} />}
        <span className="gx-gcard-tag">{tx(game.tag, lang)}</span>
      </div>
      <div className="gx-gcard-body">
        <h3><Link to={gamePath(game, lang)} className="lx-stretch">{tx(game.title, lang)}</Link></h3>
        <p>{tx(game.tagline, lang)}</p>
        <div className="gx-gcard-meta">
          <span><b>{game.level}</b></span>
          <span><ClockCircleOutlined /> {tx(game.duration, lang)}</span>
          {best !== undefined && <span className="gx-gcard-best"><TrophyOutlined /> {best}</span>}
          {stars > 0 && <span className="gx-gcard-best"><Stars n={Math.min(3, Math.round(stars / EPISODES.length))} size="sm" /> {stars}/{EPISODES.length * 3}</span>}
        </div>
        <Link to={gamePath(game, lang)} state={AUTOSTART} className="gx-gcard-play"><PlayCircleFilled />{g.play}</Link>
      </div>
    </article>
  );
}

export default function GamesHubPage({ lang }: { lang: Lang }) {
  const ui = UI[lang];
  const g = G[lang];
  const { openDemo } = useDemo();
  const path = gamesPath(lang);
  const trail: [string, string][] = [[ui.home, lang === 'fr' ? '/fr/' : '/'], [ui.learnHome, hubPath(lang)], [g.crumb, path]];
  const story = gameById('story');
  const daily = gameById('daily');

  return (
    <LearnShell
      lang={lang}
      alternates={{ en: gamesPath('en'), fr: gamesPath('fr') }}
      seo={{
        title: g.hubMetaTitle,
        description: g.hubMetaDescription,
        path,
        jsonLd: gameJsonLd({ lang, path, name: g.hubTitle.join(' '), description: g.hubMetaDescription, trail, items: GAMES.map(x => ({ name: tx(x.title, lang), path: gamePath(x, lang) })) }),
        image: `https://www.learnfrenchwithnatives.com${imageUrl('games-hero')}`,
      }}
    >
      <section className="gx-hero" aria-labelledby="gx-hub-title">
        <div className="lp-wrap gx-hero-grid">
          <div>
            <Crumbs lang={lang} items={[[ui.learnHome, hubPath(lang)], [g.crumb]]} />
            <p className="lp-eyebrow">{g.hubEyebrow}</p>
            <h1 id="gx-hub-title">{g.hubTitle[0]} <em>{g.hubTitle[1]}</em></h1>
            <p className="lx-hero-sub">{g.hubSub}</p>
            <div className="lp-hero-ctas">
              <Link to={gamePath(story, lang)} state={AUTOSTART} className="lp-btn lp-btn-primary lp-btn-lg"><PlayCircleFilled />{g.hubCta}</Link>
              <Link to={gamePath(daily, lang)} state={AUTOSTART} className="lp-btn lp-btn-ghost lp-btn-lg">{g.hubCta2}</Link>
            </div>
            <p className="lx-cat-facts"><span><CheckOutlined /> {g.free}</span></p>
          </div>
          <figure className="lx-cat-img"><img src={imageUrl('games-hero')} alt="" width="1200" height="675" fetchPriority="high" /></figure>
        </div>
      </section>

      <section className="lp-section" aria-labelledby="gx-all">
        <div className="lp-wrap">
          <header className="lp-head is-left">
            <h2 id="gx-all">{g.hubAll}</h2>
            <p>{g.hubAllSub}</p>
          </header>
          <ul className="gx-gcards">
            {GAMES.map((x, i) => <li key={x.id} className={i === 0 ? 'is-wide' : ''}><GameCard game={x} lang={lang} wide={i === 0} /></li>)}
          </ul>
        </div>
      </section>

      <section className="lp-section lp-tint" aria-labelledby="gx-why">
        <div className="lp-wrap">
          <header className="lp-head">
            <p className="lp-eyebrow">{g.hubWhyEyebrow}</p>
            <h2 id="gx-why">{g.hubWhyTitle}</h2>
          </header>
          <ul className="gx-why">
            {g.hubWhy.map(([t, d], i) => <li key={t}><span aria-hidden>{WHY_ICONS[i]}</span><strong>{t}</strong><p>{d}</p></li>)}
          </ul>
        </div>
      </section>

      <section className="lp-section" aria-labelledby="gx-next">
        <div className="lp-wrap gx-next">
          <div>
            <h2 id="gx-next" className="lx-h2">{g.hubToCourses}</h2>
            <p>{g.hubToCoursesText}</p>
            <Link to={hubPath(lang)} className="lp-btn lp-btn-primary">{g.hubToCoursesCta}<ArrowRightOutlined /></Link>
          </div>
          <div>
            <h2 className="lx-h2">{g.teacherTitle}</h2>
            <p>{g.teacherText}</p>
            <button type="button" className="lp-btn lp-btn-ghost" onClick={openDemo}>{ui.demo}<ArrowRightOutlined /></button>
          </div>
        </div>
      </section>
    </LearnShell>
  );
}
