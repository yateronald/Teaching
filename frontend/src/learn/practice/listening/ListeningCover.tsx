import { imageUrl } from '../../categories';
import { listeningCoverKey } from './catalog';
import type { ListeningExercise } from './types';

/** Decorative context, like the illustrations in Reading; the exercise title names the link. */
/** `eager`: the picture at the top of an exercise page, shown at once (the library cards load as they scroll in). */
export function ListeningCover({ exercise, sizes, eager = false }: { exercise: ListeningExercise; sizes: string; eager?: boolean }) {
  const key = listeningCoverKey(exercise);
  return <img src={imageUrl(key, 640)} srcSet={`${imageUrl(key, 640)} 640w, ${imageUrl(key, 1200)} 1200w`}
    sizes={sizes} alt="" width="640" height="360" loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : undefined} decoding="async" />;
}
