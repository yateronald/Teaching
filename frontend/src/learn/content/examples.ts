// English translations of the French example sentences (speaking steps). The
// public file only holds those of open lessons; an unlocked lesson brings its
// own (content/registry.ts, loadFullCourse).
import EXAMPLES from './example-translations.json';

export const EXAMPLE_EN: Record<string, string> = { ...(EXAMPLES as Record<string, string>) };

export function addExampleTranslations(more: Record<string, string> | undefined) {
  if (more) Object.assign(EXAMPLE_EN, more);
}
