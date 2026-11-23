// Splits the courses into what the public website may contain and what only
// the API may send (after checking the visitor's account).
//
//   node scripts/learn-pack.mjs          before `vite build` (npm run build does it)
//   node scripts/learn-pack.mjs --check  after the build: fails if any locked lesson leaked
//
// Access, computed from the study paths (studyPath/builder.ts):
//   visitor  (no account)  module 1 of the "Complete" A1 path
//   free     (an account)  module 1 of every path (4 goals × 6 levels)
//   premium                every other lesson
//
// Writes frontend/learn-private/ (never published by the web server):
//   courses/<id>.json   full lessons of every course with a locked lesson, each
//                       lesson's tier, its recordings, its example translations
//                       (read by backend/routes/learnContent.js)
//   public/…            what the build puts in the website instead
//                       (scripts/vite-learn-access.mjs): lesson outlines (titles,
//                       objectives, no exercise), the access lists, the list of
//                       recordings and example translations without the locked ones
//   leak-samples.json   sentences of locked lessons the --check step looks for in dist/
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(root, 'learn-private');
const started = Date.now();

if (process.argv.includes('--check')) {
  checkLeaks();
  process.exit(0);
}

const vite = await createServer({ root, configFile: false, optimizeDeps: { noDiscovery: true }, logLevel: 'error', server: { middlewareMode: true, hmr: false }, appType: 'custom' });
try {
  await vite.ssrLoadModule('/src/learn/ssr.ts');
  const { buildStudyPlan } = await vite.ssrLoadModule('/src/learn/studyPath/builder.ts');
  const { COURSES } = await vite.ssrLoadModule('/src/learn/catalog.ts');
  const { lessonAudioKeys, collectMedia } = await vite.ssrLoadModule('/src/learn/mediaSources.ts');

  // ── 1. The access lists, from module 1 of each path ──
  const GOALS = ['complete', 'exams', 'diploma', 'fluency'];
  const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const empty = () => ({ courses: new Set(), ladders: new Map(), items: new Set() });
  const visitor = empty();
  const free = empty();
  const addStep = (lists, step) => {
    const src = step.source;
    if (src.type === 'course') lists.courses.add(src.id);
    else if (src.type === 'ladder') {
      if (!lists.ladders.has(src.id)) lists.ladders.set(src.id, new Set());
      lists.ladders.get(src.id).add(src.level);
    } else if (src.id) lists.items.add(`${src.type}:${src.id}`);
  };
  for (const lang of ['en', 'fr']) {
    for (const goal of GOALS) {
      for (const level of LEVELS) {
        const plan = buildStudyPlan(goal, level, lang);
        const first = plan.modules[0];
        if (!first) continue;
        first.steps.forEach(s => addStep(free, s));
        if (goal === 'complete' && level === 'A1') first.steps.forEach(s => addStep(visitor, s));
      }
    }
  }
  // What a visitor may open, an account may open too.
  visitor.courses.forEach(c => free.courses.add(c));
  visitor.items.forEach(i => free.items.add(i));
  visitor.ladders.forEach((lv, c) => { if (!free.ladders.has(c)) free.ladders.set(c, new Set()); lv.forEach(l => free.ladders.get(c).add(l)); });

  const tierOf = (courseId, lesson) => {
    if (visitor.courses.has(courseId) || (lesson.level && visitor.ladders.get(courseId)?.has(lesson.level))) return 'visitor';
    if (free.courses.has(courseId) || (lesson.level && free.ladders.get(courseId)?.has(lesson.level))) return 'free';
    return 'premium';
  };

  // ── 2. Every course: which lessons are locked ──
  const manifestPath = path.join(root, 'src/learn/audio-manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const recorded = new Set(manifest.keys);
  const sealed = new Set(manifest.sealed || []);
  const examples = JSON.parse(fs.readFileSync(path.join(root, 'src/learn/content/example-translations.json'), 'utf8'));

  const courseFiles = fs.readdirSync(path.join(root, 'src/learn/content/courses')).filter(f => f.endsWith('.ts')).map(f => f.slice(0, -3));
  const published = new Set(COURSES.map(c => c.id));

  removeDir(`${OUT}.tmp`);
  fs.mkdirSync(path.join(`${OUT}.tmp`, 'courses'), { recursive: true });
  fs.mkdirSync(path.join(`${OUT}.tmp`, 'public', 'courses'), { recursive: true });

  const lockedKeys = new Set();
  const openKeys = new Set();
  const publicExamples = {};
  const lockedTexts = [];
  const openTexts = [];
  // What the website publishes about every course anyway: descriptions and outlines.
  const publishedTexts = [];
  const samples = [];
  const counts = { visitor: 0, free: 0, premium: 0 };

  // Sentences of the locked lessons the leak check looks for: plain ASCII runs
  // (they read the same in HTML, JSON and minified JavaScript).
  const SAMPLE_RE = /[A-Za-z0-9 ,.;:!?()-]{36,}/g;
  const stepStrings = (steps) => {
    const out = [];
    const walk = (v) => {
      if (typeof v === 'string') out.push(v);
      else if (Array.isArray(v)) v.forEach(walk);
      else if (v && typeof v === 'object') Object.values(v).forEach(walk);
    };
    walk(steps);
    return out;
  };

  for (const id of courseFiles) {
    const mod = await vite.ssrLoadModule(`/src/learn/content/courses/${id}.ts`);
    const lessons = mod.default;
    const ids = new Set();
    for (const l of lessons) {
      if (ids.has(l.id)) throw new Error(`course ${id}: two lessons share the id ${l.id}`);
      ids.add(l.id);
    }
    const tiers = Object.fromEntries(lessons.map(l => [l.id, tierOf(id, l)]));
    lessons.forEach(l => { if (published.has(id)) counts[tiers[l.id]]++; });
    const audio = {};
    for (const l of lessons) {
      const keys = lessonAudioKeys(l).filter(k => recorded.has(k));
      audio[l.id] = keys;
      keys.forEach(k => (tiers[l.id] === 'visitor' ? openKeys : lockedKeys).add(k));
      (tiers[l.id] === 'visitor' ? openTexts : lockedTexts).push(JSON.stringify(l.steps));
    }
    const allOpen = lessons.every(l => tiers[l.id] === 'visitor');
    publishedTexts.push(JSON.stringify(mod.about ?? null));
    const fullJson = JSON.stringify(lessons);
    const courseExamples = Object.fromEntries(Object.entries(examples).filter(([fr]) => fullJson.includes(JSON.stringify(fr).slice(1, -1))));
    if (allOpen) {
      Object.assign(publicExamples, courseExamples);
      continue;
    }
    // The outline the website shows: everything but the exercises and the notes.
    const outline = lessons.map(l => (tiers[l.id] === 'visitor' ? l : {
      id: l.id, slug: l.slug, title: l.title, summary: l.summary, objectives: l.objectives, minutes: l.minutes,
      ...(l.level ? { level: l.level } : {}),
      steps: l.steps.map(s => ({ kind: s.kind })),
      notes: { points: [] },
      locked: tiers[l.id],
    }));
    fs.writeFileSync(path.join(`${OUT}.tmp`, 'public', 'courses', `${id}.json`), JSON.stringify({ about: mod.about ?? null, lessons: outline }));
    publishedTexts.push(JSON.stringify(outline));
    fs.writeFileSync(path.join(`${OUT}.tmp`, 'courses', `${id}.json`), JSON.stringify({
      id, about: mod.about ?? null, lessons, tiers, audio,
      sealed: [...new Set(Object.values(audio).flat())].filter(k => sealed.has(k)),
      examples: courseExamples,
    }));
    for (const l of lessons) {
      if (tiers[l.id] === 'visitor') continue;
      const outlineText = JSON.stringify([l.title, l.summary, l.objectives]);
      const found = new Set();
      for (const s of stepStrings(l.steps)) for (const m of s.match(SAMPLE_RE) || []) {
        const t = m.trim();
        if (t.length >= 36 && !outlineText.includes(t)) found.add(t);
      }
      [...found].slice(0, 2).forEach(text => samples.push({ course: id, lesson: l.id, text }));
    }
  }

  // ── 3. Recordings: the public list leaves out those only locked lessons use ──
  const elsewhere = new Set(collectMedia({ courses: false }).audio.map(a => a.key));
  const hidden = new Set([...lockedKeys].filter(k => !openKeys.has(k) && !elsewhere.has(k)));
  const publicManifest = { ...manifest, keys: manifest.keys.filter(k => !hidden.has(k)), ...(manifest.sealed ? { sealed: manifest.sealed.filter(k => !hidden.has(k)) } : {}) };
  fs.writeFileSync(path.join(`${OUT}.tmp`, 'public', 'audio-manifest.json'), JSON.stringify(publicManifest));

  // Example translations used by no locked lesson stay public.
  const lockedJoined = lockedTexts.join('\n');
  for (const [fr, en] of Object.entries(examples)) {
    if (!lockedJoined.includes(JSON.stringify(fr).slice(1, -1))) publicExamples[fr] = en;
  }
  fs.writeFileSync(path.join(`${OUT}.tmp`, 'public', 'example-translations.json'), JSON.stringify(publicExamples));

  // ── 4. The access lists (public: the website shows locks with them) ──
  const lists = (l) => ({
    courses: [...l.courses].sort(),
    ladders: Object.fromEntries([...l.ladders].map(([c, v]) => [c, [...v].sort()])),
    items: [...l.items].sort(),
  });
  const accessMap = { generated: true, visitor: lists(visitor), free: lists(free) };
  fs.writeFileSync(path.join(`${OUT}.tmp`, 'public', 'access.json'), JSON.stringify(accessMap));
  fs.writeFileSync(path.join(`${OUT}.tmp`, 'access.json'), JSON.stringify({ ...accessMap, generated_at: new Date().toISOString() }, null, 1));

  // ── 5. Leak samples: never a sentence that is also public somewhere ──
  const publicCorpus = [openTexts.join('\n'), publishedTexts.join('\n'), JSON.stringify(publicExamples), publicSourceText(courseFiles, visitor, root)].join('\n');
  const finalSamples = samples.filter(s => !publicCorpus.includes(s.text));
  fs.writeFileSync(path.join(`${OUT}.tmp`, 'leak-samples.json'), JSON.stringify(finalSamples));

  // Swap in the new pack in one step (the API reads it while the site is live).
  removeDir(`${OUT}.old`);
  if (fs.existsSync(OUT)) moveDir(OUT, `${OUT}.old`);
  moveDir(`${OUT}.tmp`, OUT);
  removeDir(`${OUT}.old`);

  console.log(`✓ Learn access: ${counts.visitor} lessons open to visitors, ${counts.free} with a free account, ${counts.premium} Premium`);
  console.log(`  ${visitor.items.size} practice items open to visitors, ${free.items.size} with a free account; ${hidden.size} recordings kept off the public list; ${finalSamples.length} leak samples (${((Date.now() - started) / 1000).toFixed(1)}s)`);
} finally {
  await vite.close();
}

/**
 * Renames a folder. Windows (and folders synced by OneDrive) may hold a fresh
 * folder for a moment: a few retries, then a copy.
 */
function moveDir(from, to) {
  for (let i = 0; i < 6; i++) {
    try { fs.renameSync(from, to); return; } catch (err) {
      if (err.code !== 'EPERM' && err.code !== 'EBUSY' && err.code !== 'EACCES') throw err;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 400);
    }
  }
  fs.cpSync(from, to, { recursive: true });
  removeDir(from);
}

/** Removes a folder; one still held by Windows is left for the next run. */
function removeDir(dir) {
  try { fs.rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 }); } catch (err) {
    console.warn(`  (could not remove ${path.basename(dir)} yet: ${err.code}; it is replaced on the next run)`);
  }
}

/** The text of every source file the website publishes, except the course modules that hold locked lessons. */
function publicSourceText(courseFiles, visitorLists, rootDir) {
  const src = path.join(rootDir, 'src');
  const skip = new Set(['audio-manifest.json', 'example-translations.json']);
  const parts = [];
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) { walk(p); continue; }
      if (!/\.(ts|tsx|json)$/.test(e.name) || skip.has(e.name)) continue;
      const rel = path.relative(src, p).split(path.sep).join('/');
      const m = /^learn\/content\/courses\/(.+)\.ts$/.exec(rel);
      if (m && !visitorLists.courses.has(m[1])) continue;
      parts.push(fs.readFileSync(p, 'utf8'));
    }
  };
  walk(src);
  return parts.join('\n');
}

/** After the build: no sentence of a locked lesson may be in the published files. */
function checkLeaks() {
  const dist = path.join(root, 'dist');
  const samplesFile = path.join(OUT, 'leak-samples.json');
  if (!fs.existsSync(samplesFile)) {
    console.error('✗ learn-private/leak-samples.json is missing: run node scripts/learn-pack.mjs before the build.');
    process.exit(1);
  }
  const samples = JSON.parse(fs.readFileSync(samplesFile, 'utf8'));
  const leaks = new Map();
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) { if (!['audio', 'img', 'texts'].includes(e.name)) walk(p); continue; }
      if (!/\.(html|js|mjs|json|txt|xml|css)$/.test(e.name)) continue;
      const text = fs.readFileSync(p, 'utf8');
      for (const s of samples) if (text.includes(s.text)) leaks.set(`${s.course}/${s.lesson}`, path.relative(dist, p));
    }
  };
  if (fs.existsSync(path.join(dist, 'learn-private'))) {
    console.error('✗ dist/learn-private exists: the private pack must never be published.');
    process.exit(1);
  }
  walk(dist);
  if (leaks.size) {
    console.error(`✗ ${leaks.size} locked lesson(s) found in the public files:`);
    [...leaks].slice(0, 20).forEach(([l, f]) => console.error(`   ${l}  in  ${f}`));
    process.exit(1);
  }
  console.log(`✓ No locked lesson in the public files (${samples.length} samples checked).`);
}
