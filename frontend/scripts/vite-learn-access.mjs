// Vite plugin: the public website receives ONLY outlines/metadata for locked
// lessons and practice items — never the locked exercises, full texts,
// dialogues, ear labs, missions, listening transcripts, or dictations.
//
// Reads learn-private/public/, written by scripts/learn-pack.mjs.
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
        if (!fs.existsSync(outline)) return null;
        return `const d = ${fs.readFileSync(outline, 'utf8')};\nexport const about = d.about ?? undefined;\nexport default d.lessons;\n`;
      }

      const textMod = /\/src\/learn\/practice\/texts\/([a-z0-9-]+)\.ts$/.exec(file);
      if (textMod) {
        const stub = path.join(dir, 'practice', 'texts', `${textMod[1]}.json`);
        if (fs.existsSync(stub)) return `export default ${fs.readFileSync(stub, 'utf8')};\n`;
      }

      const earMod = /\/src\/learn\/practice\/ear\/courses\/([a-z0-9-]+)\.ts$/.exec(file);
      if (earMod) {
        const stub = path.join(dir, 'practice', 'ear', `${earMod[1]}.json`);
        if (fs.existsSync(stub)) return `export default ${fs.readFileSync(stub, 'utf8')};\n`;
      }

      const dlgMod = /\/src\/learn\/practice\/dialogues\/content\/([a-z0-9-]+)\.ts$/.exec(file);
      if (dlgMod) {
        const stub = path.join(dir, 'practice', 'dialogues', `${dlgMod[1]}.json`);
        if (fs.existsSync(stub)) return `export default ${fs.readFileSync(stub, 'utf8')};\n`;
      }

      if (file.endsWith('/src/learn/practice/text-audio.json')) {
        return read('practice/text-audio.json');
      }

      if (file.endsWith('/src/learn/practice/missions.ts')) {
        return `import { readingPath } from './meta';
export const MISSIONS = ${read('practice/missions.json')};
export const missionPath = (mission, lang) => \`\${readingPath(lang)}mission/\${mission.id}/\`;
export const missionCoverKey = (mission) => \`mission-\${mission.id}\`;
export const missionAudio = (document) => document.lines.join(' ');
export const missionVoice = (document) => document.voice ?? 'f';
`;
      }

      if (file.endsWith('/src/learn/practice/dictation/catalog.ts')) {
        return `import { skillById, skillPath } from '../meta';
export const DICTATIONS = ${read('practice/dictations.json')};
export const dictationById = (id) => DICTATIONS.find(d => d.id === id);
export const dictationPath = (lang) => skillPath(skillById('dictation'), lang);
export const dictationCoursePath = (d, lang) => \`\${dictationPath(lang)}\${d.slug}/\`;
`;
      }

      if (file.endsWith('/src/learn/practice/listening/catalog.ts')) {
        return `import { skillPath, skillById } from '../meta';
export const LISTENING = ${read('practice/listening-catalog.json')};
export const listeningCoverKey = (exercise) => \`listen-\${exercise.id}\`;
export const listeningPath = (lang) => skillPath(skillById('listening'), lang);
export const exercisePath = (exercise, lang) => \`\${listeningPath(lang)}\${exercise.id}/\`;
`;
      }

      if (file.endsWith('/src/learn/practice/listening/c1.ts')) {
        return `export const c1Listening = ${read('practice/listening-c1.json')};\n`;
      }

      if (file.endsWith('/src/learn/practice/listening/c2.ts')) {
        return `export const c2Listening = ${read('practice/listening-c2.json')};\n`;
      }

      if (file.endsWith('/src/learn/access/access-map.json')) return read('access.json');
      if (file.endsWith('/src/learn/audio-manifest.json')) return read('audio-manifest.json');
      if (file.endsWith('/src/learn/content/example-translations.json')) return read('example-translations.json');
      return null;
    },
  };
}
