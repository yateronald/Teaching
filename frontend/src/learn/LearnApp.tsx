// The learning space, downloaded on demand: picks the page for the address.
import { useLocation } from 'react-router-dom';
import NotFound from '../components/Landing/NotFound';
import { hasCourseContent, loadLessons, loadPlacement } from './content/registry';
import { resolveLearnPath } from './paths';
import { pathCourses } from './catalog';
import type { Lang } from './types';
import HubPage from './pages/HubPage';
import CategoryPage from './pages/CategoryPage';
import LevelPage, { ladderCoursesFor } from './pages/LevelPage';
import CoursePage from './pages/CoursePage';
import LessonPage from './pages/LessonPage';
import FinalPage from './pages/FinalPage';
import PlacementPage from './pages/PlacementPage';
import ProgressPage from './pages/ProgressPage';
import GamesHubPage from './pages/GamesHubPage';
import GamePage from './pages/GamePage';
import ReadingLibraryPage from './practice/pages/ReadingLibraryPage';
import PracticeHubPage from './practice/pages/PracticeHubPage';
import ReadingTextPage from './practice/pages/ReadingTextPage';
import ReadingMissionPage from './practice/pages/ReadingMissionPage';
import ListeningLibraryPage from './practice/listening/ListeningLibraryPage';
import ListeningExercisePage from './practice/listening/ListeningExercisePage';
import EarCoursePage from './practice/ear/EarCoursePage';
import { loadEar } from './practice/ear/registry';
import DialoguePage from './practice/dialogues/DialoguePage';
import { loadDialogue } from './practice/dialogues/registry';
import DictationLibraryPage from './practice/dictation/DictationLibraryPage';
import DictationCoursePage from './practice/dictation/DictationCoursePage';
import { loadAdvanced } from './practice/listening/advanced';
import { loadText } from './practice/registry';

export default function LearnApp({ lang: _lang }: { lang: Lang }) {
  const { pathname } = useLocation();
  const route = resolveLearnPath(pathname);
  switch (route.type) {
    case 'hub': return <HubPage lang={route.lang} />;
    case 'placement': return <PlacementPage lang={route.lang} />;
    case 'progress': return <ProgressPage lang={route.lang} />;
    case 'games': return <GamesHubPage lang={route.lang} />;
    case 'game': return <GamePage key={route.game.id} lang={route.lang} game={route.game} />;
    case 'category': return <CategoryPage lang={route.lang} category={route.category} />;
    case 'level': return <LevelPage key={`${route.level}-${route.category?.id ?? 'all'}`} lang={route.lang} level={route.level} category={route.category} />;
    case 'course': return <CoursePage key={route.course.id} lang={route.lang} course={route.course} />;
    case 'lesson': return <LessonPage key={route.course.id} lang={route.lang} course={route.course} lessonSlug={route.lessonSlug} />;
    case 'final': return <FinalPage key={route.course.id} lang={route.lang} course={route.course} />;
    case 'practice': return <PracticeHubPage lang={route.lang} />;
    case 'reading': return <ReadingLibraryPage lang={route.lang} />;
    case 'text': return <ReadingTextPage key={route.text.id} lang={route.lang} meta={route.text} />;
    case 'reading-mission': return <ReadingMissionPage key={route.mission.id} lang={route.lang} mission={route.mission} />;
    case 'listening': return <ListeningLibraryPage lang={route.lang} />;
    case 'listening-exercise': return <ListeningExercisePage key={route.exercise.id} lang={route.lang} exercise={route.exercise} />;
    case 'ear-course': return <EarCoursePage key={route.ear.id} lang={route.lang} meta={route.ear} />;
    case 'dialogue': return <DialoguePage key={route.dialogue.id} lang={route.lang} meta={route.dialogue} />;
    case 'dictation': return <DictationLibraryPage lang={route.lang} />;
    case 'dictation-course': return <DictationCoursePage key={route.dictation.id} lang={route.lang} course={route.dictation} />;
    default: return <NotFound lang={route.lang} />;
  }
}

/** Whatever a page needs before it can be shown exactly as pre-rendered (hydration). */
export async function prepareForPath(pathname: string) {
  const route = resolveLearnPath(pathname);
  if ((route.type === 'course' || route.type === 'lesson' || route.type === 'final') && hasCourseContent(route.course.id)) await loadLessons(route.course.id);
  if (route.type === 'placement') await loadPlacement();
  // A path page features its first course, whose outcomes may live in that course's module.
  if (route.type === 'category') {
    const first = pathCourses(route.category.id)[0];
    if (first && !first.outcomes && hasCourseContent(first.id)) await loadLessons(first.id);
  }
  if (route.type === 'text') await loadText(route.text.id);
  if (route.type === 'ear-course') await loadEar(route.ear.id);
  if (route.type === 'dialogue') await loadDialogue(route.dialogue.id, route.dialogue.theme);
  if (route.type === 'listening-exercise' && route.exercise.lazy) await loadAdvanced(route.exercise.level);
  // Level pages list the lesson of each levelled course at that level.
  if (route.type === 'level') await Promise.all(ladderCoursesFor(route.level, route.category).map(c => loadLessons(c.id)));
}
