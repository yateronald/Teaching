// A horizontal row of course cards with arrows (scroll-snap); swipe on touch
// screens. Used on the academy home and under each course.
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { CourseCard } from '../shell';
import type { CourseMeta, Lang } from '../types';
import './courseRow.css';

export function CourseRow({ lang, title, sub, courses, action, headingLevel = 3 }: {
  lang: Lang;
  title: string;
  sub?: string;
  courses: CourseMeta[];
  action?: ReactNode;
  headingLevel?: 2 | 3;
}) {
  const track = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });
  const fr = lang === 'fr';
  const H = headingLevel === 2 ? 'h2' : 'h3';
  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8 });
  }, []);
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    el.scrollTo({ left: 0 });
    const frame = requestAnimationFrame(update);
    window.addEventListener('resize', update);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', update); };
  }, [courses, update]);
  const go = (dir: number) => {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' });
  };
  return (
    <div className="ah-row">
      <div className="ah-row-head">
        <div>
          <H>{title}</H>
          {sub && <p>{sub}</p>}
        </div>
        <div className="ah-row-tools">
          {action}
          <button type="button" className="ah-arrow" onClick={() => go(-1)} disabled={edge.start} aria-label={fr ? 'Cours précédents' : 'Previous courses'}><LeftOutlined /></button>
          <button type="button" className="ah-arrow" onClick={() => go(1)} disabled={edge.end} aria-label={fr ? 'Cours suivants' : 'Next courses'}><RightOutlined /></button>
        </div>
      </div>
      <ul className="ah-row-track" ref={track} onScroll={update}>
        {courses.map(c => <li key={c.id}><CourseCard course={c} lang={lang} /></li>)}
      </ul>
    </div>
  );
}
