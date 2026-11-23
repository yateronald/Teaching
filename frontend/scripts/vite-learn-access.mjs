// Vite plugin: the public website gets the outline of a locked lesson
// (titles, objectives, no exercise), never the lesson itself.
//
// It reads learn-private/public/, written by scripts/learn-pack.mjs, and
// serves instead of the source files:
//   src/learn/content/courses/<id>.ts      the course with its locked lessons as outlines
//   src/learn/access/access-map.json       the access lists (visitor / free account / Premium)
//   src/learn/audio-manifest.json          the recordings, minus those of locked lessons only
//   src/learn/content/example-translations.json   minus those of locked lessons only
//
// A production build without the pack stops with an error: it would publish
// every lesson. A dev server without it shows everything (and says so).
import fs from 'node:fs';
import path from 'node:path';

export default function learnAccess() {
  let dir = '';
  let enabled = false;
  const read = (rel) => fs.readFileSync(path.join(dir, rel), 'utf8');

  return {
    name: 'lfwn-learn-access',
    enforce: 'pre',
    configResolved(config) {
      dir = path.join(config.root, 'learn-private', 'public');
      enabled = fs.existsSync(path.join(dir, 'access.json'));
      if (!enabled && config.command === 'build') {
        throw new Error('learn-private/ is missing: run `node scripts/learn-pack.mjs` before `vite build` (npm run build does it). Building without it would publish every locked lesson.');
      }
      if (!enabled) config.logger.warn('[learn-access] learn-private/ not found: every lesson is open in this dev server. Run `node scripts/learn-pack.mjs` to see the locks.');
    },
    load(id) {
      if (!enabled) return null;
      const file = id.split('?')[0].replace(/\\/g, '/');
      const course = /\/src\/learn\/content\/courses\/([a-z0-9-]+)\.ts$/.exec(file);
      if (course) {
        const outline = path.join(dir, 'courses', `${course[1]}.json`);
        if (!fs.existsSync(outline)) return null; // every lesson open: the module as written
        return `const d = ${fs.readFileSync(outline, 'utf8')};\nexport const about = d.about ?? undefined;\nexport default d.lessons;\n`;
      }
      if (file.endsWith('/src/learn/access/access-map.json')) return read('access.json');
      if (file.endsWith('/src/learn/audio-manifest.json')) return read('audio-manifest.json');
      if (file.endsWith('/src/learn/content/example-translations.json')) return read('example-translations.json');
      return null;
    },
  };
}
