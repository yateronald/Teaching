// /learn/my-progress/: everything saved in this browser (not indexed).
import { Link } from 'react-router-dom';
import { ArrowRightOutlined, FireFilled, ReadOutlined, SafetyCertificateOutlined, StarFilled } from '@ant-design/icons';
import { COURSES, coursePath, courseById } from '../catalog';
import { finalPath, hubPath, placementPath, progressPath } from '../paths';
import { BADGES, courseDone, resetProgress, streak, today, useProgress } from '../progress';
import { Crumbs, LearnShell, LevelChip, TeacherCta, useMounted } from '../shell';
import { tx, type Lang } from '../types';
import { UI } from '../ui';

function Heatmap({ days, lang }: { days: string[]; lang: Lang }) {
  const set = new Set(days);
  const cells = Array.from({ length: 28 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (27 - i));
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return { k, on: set.has(k), today: k === today() };
  });
  return (
    <div className="lx-heat" aria-label={UI[lang].progress.activity}>
      {cells.map(c => <i key={c.k} className={`${c.on ? 'is-on' : ''}${c.today ? ' is-today' : ''}`} title={c.k} />)}
    </div>
  );
}

export default function ProgressPage({ lang }: { lang: Lang }) {
  const ui = UI[lang];
  const pr = ui.progress;
  const p = useProgress();
  const mounted = useMounted();
  const started = COURSES.filter(c => courseDone(p, c.id, c.lessonCount) > 0 || p.finals[c.id]);
  const certs = Object.entries(p.finals).filter(([, f]) => f.passed);

  return (
    <LearnShell lang={lang} alternates={{ en: progressPath('en'), fr: progressPath('fr') }} seo={{ title: pr.metaTitle, description: pr.sub, path: progressPath(lang), noindex: true }}>
      <section className="lx-lesson-hero">
        <div className="lp-wrap">
          <Crumbs lang={lang} items={[[ui.learnHome, hubPath(lang)], [pr.title]]} />
          <h1>{pr.title}</h1>
          <p className="lx-hero-sub">{pr.sub}</p>
          {mounted && (
            <dl className="lx-pstats">
              <div><dt><StarFilled /> {pr.xp}</dt><dd>{p.xp}</dd></div>
              <div><dt><FireFilled /> {pr.streak}</dt><dd>{streak(p)}</dd></div>
              <div><dt><ReadOutlined /> {pr.lessonsDone}</dt><dd>{Object.keys(p.lessons).length}</dd></div>
              <div><dt><SafetyCertificateOutlined /> {pr.certificates}</dt><dd>{certs.length}</dd></div>
              <div className="is-wide">
                <dt>{pr.level}</dt>
                <dd>{p.placement ? <LevelChip level={p.placement.level} /> : <Link to={placementPath(lang)} className="lx-link">{pr.takeTest} →</Link>}</dd>
              </div>
            </dl>
          )}
        </div>
      </section>
      {mounted && (
        <section className="lp-section">
          <div className="lp-wrap lx-cat-layout">
            <div>
              <h2 className="lx-h2">{pr.activity}</h2>
              <Heatmap days={p.days} lang={lang} />
              <h2 className="lx-h2">{pr.courses}</h2>
              {started.length === 0 ? (
                <p className="lx-empty">{pr.nothing} <Link to={hubPath(lang)} className="lx-link">{pr.browse} →</Link></p>
              ) : (
                <ul className="lx-prog-list">
                  {started.map(c => {
                    const n = courseDone(p, c.id, c.lessonCount);
                    const f = p.finals[c.id];
                    return (
                      <li key={c.id}>
                        <Link to={coursePath(c, lang)}>
                          <LevelChip level={c.level} size="sm" />
                          <strong>{tx(c.title, lang)}</strong>
                          <i><b style={{ transform: `scaleX(${n / c.lessonCount})` }} /></i>
                          <span>{n}/{c.lessonCount}{f?.passed ? ' · ✓' : ''}</span>
                          <ArrowRightOutlined />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
              {certs.length > 0 && (
                <>
                  <h2 className="lx-h2">{pr.certificates}</h2>
                  <ul className="lx-prog-list">
                    {certs.map(([id, f]) => {
                      const c = courseById(id);
                      return c ? <li key={id}><Link to={finalPath(c, lang)}><SafetyCertificateOutlined /><strong>{tx(c.title, lang)}</strong><span>{Math.round(f.best * 100)}%</span><ArrowRightOutlined /></Link></li> : null;
                    })}
                  </ul>
                </>
              )}
              <h2 className="lx-h2">{pr.badges}</h2>
              <ul className="lx-badges">
                {BADGES.map(b => {
                  const has = p.badges.includes(b);
                  return (
                    <li key={b} className={`lx-badge${has ? ' is-on' : ''}`}>
                      <span className="lx-badge-medal" aria-hidden>★</span>
                      <div><strong>{ui.badges[b][0]}</strong><small>{ui.badges[b][1]}</small></div>
                    </li>
                  );
                })}
              </ul>
              <button type="button" className="lx-link lx-reset" onClick={() => { if (window.confirm(pr.resetConfirm)) resetProgress(); }}>{pr.reset}</button>
            </div>
            <aside className="lx-side"><TeacherCta lang={lang} compact /></aside>
          </div>
        </section>
      )}
    </LearnShell>
  );
}
