// The learning space, downloaded on demand: picks the page for the address.
import { useLocation } from 'react-router-dom';
import NotFound from '../components/Landing/NotFound';
import { hasCourseContent, loadLessons, loadPlacement } from './content/registry';
import { resolveLearnPath } from './paths';
import type { Lang } from './types';
import HubPage from './pages/HubPage';
import CategoryPage from './pages/CategoryPage';
import CoursePage from './pages/CoursePage';
import LessonPage from './pages/LessonPage';
import FinalPage from './pages/FinalPage';
import PlacementPage from './pages/PlacementPage';
import ProgressPage from './pages/ProgressPage';

export default function LearnApp({ lang: _lang }: { lang: Lang }) {
  const { pathname } = useLocation();
  const route = resolveLearnPath(pathname);
  switch (route.type) {
    case 'hub': return <HubPage lang={route.lang} />;
    case 'placement': return <PlacementPage lang={route.lang} />;
    case 'progress': return <ProgressPage lang={route.lang} />;
    case 'category': return <CategoryPage lang={route.lang} category={route.category} />;
    case 'course': return <CoursePage key={route.course.id} lang={route.lang} course={route.course} />;
    case 'lesson': return <LessonPage key={route.course.id} lang={route.lang} course={route.course} lessonSlug={route.lessonSlug} />;
    case 'final': return <FinalPage key={route.course.id} lang={route.lang} course={route.course} />;
    default: return <NotFound lang={route.lang} />;
  }
}

/** Whatever a page needs before it can be shown exactly as pre-rendered (hydration). */
export async function prepareForPath(pathname: string) {
  const route = resolveLearnPath(pathname);
  if ((route.type === 'course' || route.type === 'lesson' || route.type === 'final') && hasCourseContent(route.course.id)) await loadLessons(route.course.id);
  if (route.type === 'placement') await loadPlacement();
}
