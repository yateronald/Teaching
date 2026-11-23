// The page of a game (/learn/games/<game>/): what it is, how to play, the best
// score, and the game itself, which opens over the page.
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRightOutlined, CheckOutlined, ClockCircleOutlined, LockOutlined, PlayCircleFilled, RiseOutlined, TrophyOutlined } from '@ant-design/icons';
import { imageUrl } from '../categories';
import { absoluteMediaUrl } from '../mediaUrl';
import { itemTier } from '../access';
import { stop as stopAudio } from '../audio';
import { G } from '../games/copy';
import { freeForAllCopy, isTierLocked, useAccount } from '../account/store';
import DailyWord from '../games/DailyWord';
import { GameArt, Stars } from '../games/frame';
import GenderBlitz from '../games/GenderBlitz';
import { GAMES, gamePath, gamesPath, type GameMeta } from '../games/meta';
import NumberBingo from '../games/NumberBingo';
import PairsGame from '../games/PairsGame';
import { EPISODES } from '../games/story';
import StoryGame from '../games/StoryGame';
import { dayStamp } from '../games/words';
import { hasAutostart, hubPath } from '../paths';
import { setStoryVoice, useProgress } from '../progress';
import { gameJsonLd } from '../schema';
import { Crumbs, LearnShell, TeacherCta, useMounted } from '../shell';
import { tx, type Lang } from '../types';
import { UI } from '../ui';
import { Overlay, useScrollLock } from './LessonPage';

export default function GamePage({ lang, game }: { lang: Lang; game: GameMeta }) {
  const ui = UI[lang];
  const g = G[lang];
  const account = useAccount();
  const free = freeForAllCopy(account);
  const gameLocked = isTierLocked(account, itemTier(`game:${game.id}`));
  const p = useProgress();
  const mounted = useMounted();
  const [playing, setPlaying] = useState(false);
  const [episode, setEpisode] = useState(0);
  const [run, setRun] = useState(0);
  const [practice, setPractice] = useState(false);
  useScrollLock(playing);
  useEffect(() => {
    if (gameLocked && playing) {
      stopAudio();
      setPlaying(false);
    }
  }, [gameLocked, playing]);

  const title = tx(game.title, lang);
  const path = gamePath(game, lang);
  const isStory = game.id === 'story';
  const story = mounted ? p.story ?? {} : {};
  const voice = (mounted && p.storyVoice) || 'f';
  const unlocked = (n: number) => n === 0 || (story[EPISODES[n - 1].id] ?? 0) > 0;
  const nextEpisode = Math.max(0, EPISODES.findIndex((e, n) => unlocked(n) && !story[e.id]));
  const stats = mounted ? p.games?.[game.id] : undefined;
  const dailyDone = mounted && game.id === 'daily' && p.daily?.day === dayStamp() && (p.daily.won || p.daily.guesses.length >= 6);

  const play = (n?: number) => { if (n !== undefined) setEpisode(n); setPractice(!!dailyDone); setRun(r => r + 1); setPlaying(true); };

  // “Play” on a game card of the hub: the game opens at once.
  const location = useLocation();
  const navigate = useNavigate();
  const autostart = hasAutostart(location.state);
  useEffect(() => {
    if (!autostart || !mounted) return;
    navigate(location.pathname, { replace: true, state: null });
    play(isStory ? nextEpisode : undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autostart, mounted]);

  const trail: [string, string][] = [[ui.home, lang === 'fr' ? '/fr/' : '/'], [ui.learnHome, hubPath(lang)], [g.crumb, gamesPath(lang)], [title, path]];
  const image = isStory ? 'story-airport' : 'games-hero';
  const cta = isStory
    ? (Object.keys(story).length ? `${g.resume} : ${tx(EPISODES[nextEpisode].title, lang)}` : g.storyStart)
    : game.id === 'daily' && dailyDone ? g.dailyPracticeCta : g.play;

  return (
    <LearnShell
      lang={lang}
      alternates={{ en: gamePath(game, 'en'), fr: gamePath(game, 'fr') }}
      seo={{
        title: `${title}${lang === 'fr' ? ' : ' : ': '}${tx(game.tag, lang)} | Learn French with Natives`,
        description: tx(game.description, lang).slice(0, 300),
        path,
        jsonLd: gameJsonLd({ lang, path, name: title, description: tx(game.description, lang), trail, level: game.level }),
        image: absoluteMediaUrl(imageUrl(image)),
      }}
    >
      <section className="gx-hero" aria-labelledby="gx-game-title">
        <div className="lp-wrap gx-hero-grid">
          <div>
            <Crumbs lang={lang} items={[[ui.learnHome, hubPath(lang)], [g.crumb, gamesPath(lang)], [title]]} />
            <p className="lp-eyebrow">{tx(game.tag, lang)}</p>
            <h1 id="gx-game-title">{title}</h1>
            <p className="lx-hero-sub">{tx(game.tagline, lang)}</p>
            <p className="gx-hero-desc">{tx(game.description, lang)}</p>
            <div className="lp-hero-ctas">
              <button type="button" className="lp-btn lp-btn-primary lp-btn-lg gx-play" onClick={() => play(isStory ? nextEpisode : undefined)}><PlayCircleFilled />{cta}</button>
              <Link to={gamesPath(lang)} className="lp-btn lp-btn-ghost lp-btn-lg">{g.backToGames}</Link>
            </div>
            <p className="lx-cat-facts">
              <span><RiseOutlined /> {g.level} {game.level}</span>
              <span><ClockCircleOutlined /> {tx(game.duration, lang)}</span>
              <span><CheckOutlined /> {free ? g.freeNow : g.free}</span>
            </p>
            {stats && (
              <p className="gx-best"><TrophyOutlined /> {g.best} : <b>{stats.best}</b> · {g.plays(stats.plays)}</p>
            )}
            {mounted && game.id === 'daily' && p.daily && (
              <p className="gx-best"><TrophyOutlined /> {g.dailyStreak} : <b>{g.dailyDays(p.daily.streak)}</b> · {g.dailyWins} : <b>{p.daily.wins}</b></p>
            )}
            <noscript><p className="lx-note">{ui.lesson.noJs}</p></noscript>
          </div>
          <div className="gx-hero-art">
            {isStory
              ? <figure className="lx-cat-img"><img src={imageUrl('story-airport')} alt="" width="1200" height="675" fetchPriority="high" /></figure>
              : <GameArt id={game.id} />}
          </div>
        </div>
      </section>

      <section className="lp-section" aria-labelledby="gx-how">
        <div className="lp-wrap lx-cat-layout">
          <div>
            {isStory && (
              <>
                <div className="gx-ep-head">
                  <h2 className="lx-h2">{g.storyEpisodes}</h2>
                  <div className="gx-voice" role="group" aria-label={g.storyVoice}>
                    <span>{g.storyVoice}</span>
                    <button type="button" className={voice === 'f' ? 'is-on' : ''} aria-pressed={voice === 'f'} onClick={() => setStoryVoice('f')}>{g.storyVoiceF}</button>
                    <button type="button" className={voice === 'm' ? 'is-on' : ''} aria-pressed={voice === 'm'} onClick={() => setStoryVoice('m')}>{g.storyVoiceM}</button>
                  </div>
                </div>
                <ol className="gx-episodes">
                  {EPISODES.map((ep, n) => {
                    const open = !mounted || unlocked(n);
                    const stars = story[ep.id] ?? 0;
                    return (
                      <li key={ep.id} className={open ? '' : 'is-locked'}>
                        <button type="button" className="gx-episode" onClick={() => open && play(n)} disabled={!open} title={open ? undefined : g.storyLocked}>
                          <img src={imageUrl(ep.image, 640)} alt="" loading="lazy" width="640" height="360" />
                          <div>
                            <h3>{tx(ep.title, lang)}</h3>
                            <p>{open ? tx(ep.summary, lang) : g.storyLocked}</p>
                            {stars > 0 && <Stars n={stars} size="sm" />}
                          </div>
                          <span className="lx-round-arrow is-play" aria-hidden>{open ? <PlayCircleFilled /> : <LockOutlined />}</span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </>
            )}

            <h2 id="gx-how" className="lx-h2">{g.howTitle}</h2>
            <ol className="lx-outcomes gx-how">
              {game.how.map((h, i) => <li key={i}><span>{String(i + 1).padStart(2, '0')}</span>{tx(h, lang)}</li>)}
            </ol>
            <h3 className="lx-h3">{g.skills}</h3>
            <ul className="gx-skills">{game.skills.map((s, i) => <li key={i}><CheckOutlined aria-hidden />{tx(s, lang)}</li>)}</ul>
          </div>

          <aside className="lx-side">
            <nav className="gx-others" aria-label={g.otherGames}>
              <p>{g.otherGames}</p>
              <ul>
                {GAMES.filter(x => x.id !== game.id).map(x => (
                  <li key={x.id}>
                    <Link to={gamePath(x, lang)}><strong>{tx(x.title, lang)}</strong><span>{tx(x.tag, lang)}</span><ArrowRightOutlined /></Link>
                  </li>
                ))}
              </ul>
            </nav>
            <TeacherCta lang={lang} compact />
          </aside>
        </div>
      </section>

      {playing && (
        <Overlay>
          {game.id === 'story' && (
            <StoryGame
              key={`${episode}-${run}`}
              lang={lang}
              episode={EPISODES[episode]}
              voice={voice}
              hasNext={episode + 1 < EPISODES.length}
              onClose={() => setPlaying(false)}
              onNext={() => play(episode + 1)}
            />
          )}
          {game.id === 'gender' && <GenderBlitz key={run} lang={lang} onClose={() => setPlaying(false)} />}
          {game.id === 'numbers' && <NumberBingo key={run} lang={lang} onClose={() => setPlaying(false)} />}
          {game.id === 'pairs' && <PairsGame key={run} lang={lang} onClose={() => setPlaying(false)} />}
          {game.id === 'daily' && <DailyWord key={run} lang={lang} startInPractice={practice} onClose={() => setPlaying(false)} />}
        </Overlay>
      )}
    </LearnShell>
  );
}
