// Splits ALL courses and practice libraries into what the public website may
// contain (visitor tier + outlines) and what only the authenticated API may send
// (free account and Premium tiers).
//
//   node scripts/learn-pack.mjs          before `vite build` (npm run build does it)
//   node scripts/learn-pack.mjs --check  after the build: fails if any locked content leaked
//
// Access, computed from the study paths (studyPath/builder.ts):
//   visitor  (no account)  module 1 of the "Complete" A1 path
//   free     (an account)  module 1 of every path (4 goals × 6 levels)
//   premium                every other lesson, practice exercise, dictation, and game
//
// Writes frontend/learn-private/ (never published by the web server):
//   courses/<id>.json            full lessons + tiers + audio + examples
//   practice/<kind>/<id>.json    full practice items (text, mission, dialogue, ear, doc, dictation, game)
//   public/...                   stripped public outlines + filtered audio-manifest/text-audio
//   leak-samples.json            sentences of locked courses & practice items checked in dist/
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
  const { lessonAudioKeys } = await vite.ssrLoadModule('/src/learn/mediaSources.ts');
  const { audioKey, normalizeForAudio, NO_AUDIO } = await vite.ssrLoadModule('/src/learn/audio.ts');
  const { PLACEMENT } = await vite.ssrLoadModule('/src/learn/content/placement.ts');
  const { GAMES } = await vite.ssrLoadModule('/src/learn/games/meta.ts');
  const { CAST, EPISODES, playerLines } = await vite.ssrLoadModule('/src/learn/games/story.ts');
  const { DAILY_WORDS, GENDER_NOUNS, PAIR_DECKS, numberCall, withArticle } = await vite.ssrLoadModule('/src/learn/games/words.ts');
  const { MISSIONS, missionAudio, missionVoice } = await vite.ssrLoadModule('/src/learn/practice/missions.ts');
  const { LISTENING } = await vite.ssrLoadModule('/src/learn/practice/listening/catalog.ts');
  const { c1Listening } = await vite.ssrLoadModule('/src/learn/practice/listening/c1.ts');
  const { c2Listening } = await vite.ssrLoadModule('/src/learn/practice/listening/c2.ts');
  const { LISTENING_VOICES, passageAudio, questionAudio } = await vite.ssrLoadModule('/src/learn/practice/listening/types.ts');
  const { DICTATIONS } = await vite.ssrLoadModule('/src/learn/practice/dictation/catalog.ts');
  const { DICTATION_VOICES } = await vite.ssrLoadModule('/src/learn/practice/dictation/types.ts');
  const { countWords } = await vite.ssrLoadModule('/src/learn/practice/dictation/diff.ts');

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
  visitor.courses.forEach(c => free.courses.add(c));
  visitor.items.forEach(i => free.items.add(i));
  visitor.ladders.forEach((lv, c) => { if (!free.ladders.has(c)) free.ladders.set(c, new Set()); lv.forEach(l => free.ladders.get(c).add(l)); });

  const tierOf = (courseId, lesson) => {
    if (visitor.courses.has(courseId) || (lesson.level && visitor.ladders.get(courseId)?.has(lesson.level))) return 'visitor';
    if (free.courses.has(courseId) || (lesson.level && free.ladders.get(courseId)?.has(lesson.level))) return 'free';
    return 'premium';
  };
  const itemTierOf = (kind, id) => {
    const key = `${kind}:${id}`;
    if (visitor.items.has(key)) return 'visitor';
    if (free.items.has(key)) return 'free';
    return 'premium';
  };

  // ── 2. Shared helpers & output folders ──
  const manifestPath = path.join(root, 'src/learn/audio-manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const recorded = new Set(manifest.keys);
  const sealed = new Set(manifest.sealed || []);
  const examples = JSON.parse(fs.readFileSync(path.join(root, 'src/learn/content/example-translations.json'), 'utf8'));
  const textAudioAll = JSON.parse(fs.readFileSync(path.join(root, 'src/learn/practice/text-audio.json'), 'utf8'));

  const keyFor = (text, voice = 'f') => {
    const t = normalizeForAudio(text);
    if (!t || NO_AUDIO.has(t)) return null;
    const k = audioKey(t, voice);
    return recorded.has(k) ? k : null;
  };
  const collectKeys = (pairs) => {
    const s = new Set();
    for (const [text, voice] of pairs) {
      const k = keyFor(text, voice);
      if (k) s.add(k);
    }
    return [...s];
  };

  const courseFiles = fs.readdirSync(path.join(root, 'src/learn/content/courses')).filter(f => f.endsWith('.ts')).map(f => f.slice(0, -3));
  const published = new Set(COURSES.map(c => c.id));

  removeDir(`${OUT}.tmp`);
  const TMP = `${OUT}.tmp`;
  fs.mkdirSync(path.join(TMP, 'courses'), { recursive: true });
  for (const kind of ['text', 'mission', 'dialogue', 'ear', 'doc', 'dictation', 'game']) {
    fs.mkdirSync(path.join(TMP, 'practice', kind), { recursive: true });
  }
  for (const dir of ['courses', 'practice/texts', 'practice/ear', 'practice/dialogues']) {
    fs.mkdirSync(path.join(TMP, 'public', dir), { recursive: true });
  }

  const lockedKeys = new Set();
  const openKeys = new Set();
  const alwaysPublicAudio = new Set();
  const publicExamples = {};
  const lockedTexts = [];
  const openTexts = [];
  const publishedTexts = [];
  const samples = [];
  const counts = { visitor: 0, free: 0, premium: 0 };
  const practiceCounts = { visitor: 0, free: 0, premium: 0 };

  const SAMPLE_RE = /[A-Za-z0-9 ,.;:!?()-]{32,}/g;
  const allStrings = (v) => {
    const out = [];
    const walk = (x) => {
      if (typeof x === 'string') out.push(x);
      else if (Array.isArray(x)) x.forEach(walk);
      else if (x && typeof x === 'object') Object.values(x).forEach(walk);
    };
    walk(v);
    return out;
  };
  const addSamples = (courseLabel, itemLabel, bodyObj, excludeObj = null, max = 2) => {
    const exclude = excludeObj ? JSON.stringify(excludeObj) : '';
    const found = new Set();
    for (const s of allStrings(bodyObj)) {
      for (const m of s.match(SAMPLE_RE) || []) {
        const t = m.trim();
        if (t.length >= 32 && !exclude.includes(t)) found.add(t);
      }
    }
    [...found].slice(0, max).forEach(text => samples.push({ course: courseLabel, lesson: itemLabel, text }));
  };

  // ── 3. Pack every course ──
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
    const outline = lessons.map(l => (tiers[l.id] === 'visitor' ? l : {
      id: l.id, slug: l.slug, title: l.title, summary: l.summary, objectives: l.objectives, minutes: l.minutes,
      ...(l.level ? { level: l.level } : {}),
      steps: l.steps.map(s => ({ kind: s.kind })),
      notes: { points: [] },
      locked: tiers[l.id],
    }));
    fs.writeFileSync(path.join(TMP, 'public', 'courses', `${id}.json`), JSON.stringify({ about: mod.about ?? null, lessons: outline }));
    publishedTexts.push(JSON.stringify(outline));
    fs.writeFileSync(path.join(TMP, 'courses', `${id}.json`), JSON.stringify({
      id, about: mod.about ?? null, lessons, tiers, audio,
      sealed: [...new Set(Object.values(audio).flat())].filter(k => sealed.has(k)),
      examples: courseExamples,
    }));
    for (const l of lessons) {
      if (tiers[l.id] === 'visitor') continue;
      addSamples(id, l.id, l.steps, [l.title, l.summary, l.objectives], 2);
    }
  }

  // ── 4. Pack ALL Practice Content (Texts, Missions, Dialogues, Ear, Listening, Dictations) ──
  // 4a. Reading texts + text-audio.json
  const publicTextAudio = {};
  const textFiles = fs.readdirSync(path.join(root, 'src/learn/practice/texts')).filter(f => f.endsWith('.ts')).map(f => f.slice(0, -3));
  for (const id of textFiles) {
    const text = (await vite.ssrLoadModule(`/src/learn/practice/texts/${id}.ts`)).default;
    const tier = itemTierOf('text', id);
    practiceCounts[tier]++;
    const keys = collectKeys([...text.glossary.map(g => [g.fr, 'f']), ...text.focus.examples.map(e => [e.fr, 'f'])]);
    if (tier === 'visitor') {
      keys.forEach(k => openKeys.add(k));
      if (textAudioAll[id]) publicTextAudio[id] = textAudioAll[id];
      openTexts.push(JSON.stringify(text));
    } else {
      keys.forEach(k => lockedKeys.add(k));
      lockedTexts.push(JSON.stringify(text));
      fs.writeFileSync(path.join(TMP, 'public', 'practice', 'texts', `${id}.json`), JSON.stringify({ id, locked: tier }));
      fs.writeFileSync(path.join(TMP, 'practice', 'text', `${id}.json`), JSON.stringify({
        id, tier, data: text,
        audio: { keys, sealed: keys.filter(k => sealed.has(k)) },
        textAudio: textAudioAll[id] ?? null,
      }));
      addSamples('practice/text', id, [text.paras, text.questions], { id }, 2);
    }
  }
  fs.writeFileSync(path.join(TMP, 'public', 'practice', 'text-audio.json'), JSON.stringify(publicTextAudio));

  // 4b. Ear courses
  const earFiles = fs.readdirSync(path.join(root, 'src/learn/practice/ear/courses')).filter(f => f.endsWith('.ts')).map(f => f.slice(0, -3));
  for (const id of earFiles) {
    const course = (await vite.ssrLoadModule(`/src/learn/practice/ear/courses/${id}.ts`)).default;
    const tier = itemTierOf('ear', id);
    practiceCounts[tier]++;
    const pairs = [
      ...course.examples.flatMap(e => (e.natural ? [[e.say, e.voice], [e.natural, e.voice]] : [[e.say, e.voice]])),
      ...course.items.map(it => [it.say, it.voice]),
    ];
    const keys = collectKeys(pairs);
    if (tier === 'visitor') {
      keys.forEach(k => openKeys.add(k));
      openTexts.push(JSON.stringify(course));
    } else {
      keys.forEach(k => lockedKeys.add(k));
      lockedTexts.push(JSON.stringify(course));
      fs.writeFileSync(path.join(TMP, 'public', 'practice', 'ear', `${id}.json`), JSON.stringify({ id, locked: tier }));
      fs.writeFileSync(path.join(TMP, 'practice', 'ear', `${id}.json`), JSON.stringify({
        id, tier, data: course,
        audio: { keys, sealed: keys.filter(k => sealed.has(k)) },
      }));
      addSamples('practice/ear', id, [course.items, course.rule], { id }, 2);
    }
  }

  // 4c. Dialogues (grouped per theme file)
  const dialogueThemes = fs.readdirSync(path.join(root, 'src/learn/practice/dialogues/content')).filter(f => f.endsWith('.ts')).map(f => f.slice(0, -3));
  for (const theme of dialogueThemes) {
    const mod = (await vite.ssrLoadModule(`/src/learn/practice/dialogues/content/${theme}.ts`)).default;
    const pub = {};
    let anyLocked = false;
    for (const [id, dlg] of Object.entries(mod)) {
      const tier = itemTierOf('dialogue', id);
      practiceCounts[tier]++;
      const keys = collectKeys(dlg.lines.map(l => [l.fr, dlg.speakers[l.who].voice]));
      if (tier === 'visitor') {
        pub[id] = dlg;
        keys.forEach(k => openKeys.add(k));
        openTexts.push(JSON.stringify(dlg));
      } else {
        anyLocked = true;
        pub[id] = { id, locked: tier };
        keys.forEach(k => lockedKeys.add(k));
        lockedTexts.push(JSON.stringify(dlg));
        fs.writeFileSync(path.join(TMP, 'practice', 'dialogue', `${id}.json`), JSON.stringify({
          id, tier, data: dlg,
          audio: { keys, sealed: keys.filter(k => sealed.has(k)) },
        }));
        addSamples('practice/dialogue', id, [dlg.lines, dlg.questions], { id }, 2);
      }
    }
    if (anyLocked) {
      fs.writeFileSync(path.join(TMP, 'public', 'practice', 'dialogues', `${theme}.json`), JSON.stringify(pub));
    }
  }

  // 4d. Reading Missions
  const pubMissions = [];
  for (const m of MISSIONS) {
    const tier = itemTierOf('mission', m.id);
    practiceCounts[tier]++;
    const keys = collectKeys(m.documents.map(d => [missionAudio(d), missionVoice(d)]));
    if (tier === 'visitor') {
      pubMissions.push(m);
      keys.forEach(k => openKeys.add(k));
      openTexts.push(JSON.stringify(m));
    } else {
      keys.forEach(k => lockedKeys.add(k));
      lockedTexts.push(JSON.stringify(m));
      pubMissions.push({
        id: m.id, level: m.level, minutes: m.minutes,
        title: m.title, summary: m.summary, brief: m.brief,
        recipient: m.recipient, documents: [], documentCount: m.documents.length,
        tip: { en: '', fr: '' }, locked: tier,
      });
      fs.writeFileSync(path.join(TMP, 'practice', 'mission', `${m.id}.json`), JSON.stringify({
        id: m.id, tier, data: m,
        audio: { keys, sealed: keys.filter(k => sealed.has(k)) },
      }));
      addSamples('practice/mission', m.id, m.documents, [m.title, m.summary, m.brief], 2);
    }
  }
  fs.writeFileSync(path.join(TMP, 'public', 'practice', 'missions.json'), JSON.stringify(pubMissions));
  publishedTexts.push(JSON.stringify(pubMissions));

  // 4e. Listening documents (catalog, c1, c2)
  const allDocs = new Map();
  for (const e of [...LISTENING.filter(x => !x.lazy), ...c1Listening, ...c2Listening]) {
    allDocs.set(e.id, e);
  }
  for (const e of allDocs.values()) {
    const tier = itemTierOf('doc', e.id);
    practiceCounts[tier]++;
    const pairs = [
      ...LISTENING_VOICES.map(v => [passageAudio(e), v]),
      ...e.segments.map(seg => [seg, e.voice]),
      ...e.questions.map(q => [questionAudio(q), e.voice]),
    ];
    const keys = collectKeys(pairs);
    if (tier === 'visitor') {
      keys.forEach(k => openKeys.add(k));
      openTexts.push(JSON.stringify(e));
    } else {
      keys.forEach(k => lockedKeys.add(k));
      lockedTexts.push(JSON.stringify(e));
      fs.writeFileSync(path.join(TMP, 'practice', 'doc', `${e.id}.json`), JSON.stringify({
        id: e.id, tier, data: e,
        audio: { keys, sealed: keys.filter(k => sealed.has(k)) },
      }));
      addSamples('practice/doc', e.id, [e.segments, e.questions], [e.title, e.summary, e.format], 2);
    }
  }
  const stubDoc = (e, tier) => ({
    id: e.id, level: e.level, format: e.format, title: e.title, summary: e.summary,
    goal: { en: '', fr: '' }, strategy: { en: '', fr: '' },
    voice: e.voice, segments: [], questions: [],
    count: e.count ?? e.questions.length, lazy: true,
    ...(tier !== 'visitor' ? { locked: tier } : {}),
  });
  const pubCatalog = LISTENING.map(e => ((itemTierOf('doc', e.id) === 'visitor' && !e.lazy) ? e : stubDoc(e, itemTierOf('doc', e.id))));
  const pubC1 = c1Listening.map(e => (itemTierOf('doc', e.id) === 'visitor' ? e : stubDoc(e, itemTierOf('doc', e.id))));
  const pubC2 = c2Listening.map(e => (itemTierOf('doc', e.id) === 'visitor' ? e : stubDoc(e, itemTierOf('doc', e.id))));
  fs.writeFileSync(path.join(TMP, 'public', 'practice', 'listening-catalog.json'), JSON.stringify(pubCatalog));
  fs.writeFileSync(path.join(TMP, 'public', 'practice', 'listening-c1.json'), JSON.stringify(pubC1));
  fs.writeFileSync(path.join(TMP, 'public', 'practice', 'listening-c2.json'), JSON.stringify(pubC2));
  publishedTexts.push(JSON.stringify(pubCatalog));

  // 4f. Dictations
  const pubDictations = [];
  for (const d of DICTATIONS) {
    const tier = itemTierOf('dictation', d.id);
    practiceCounts[tier]++;
    const pairs = DICTATION_VOICES.flatMap(v => [[d.text, v], ...d.rules.flatMap(r => r.examples.map(ex => [ex.fr, v]))]);
    const keys = collectKeys(pairs);
    if (tier === 'visitor') {
      pubDictations.push(d);
      keys.forEach(k => openKeys.add(k));
      openTexts.push(JSON.stringify(d));
    } else {
      keys.forEach(k => lockedKeys.add(k));
      lockedTexts.push(JSON.stringify(d));
      pubDictations.push({
        id: d.id, slug: d.slug, title: d.title, subtitle: d.subtitle, level: d.level,
        ...(d.method ? { method: d.method } : {}),
        theme: d.theme, focus: d.focus, image: d.image, minutes: d.minutes,
        wordCount: countWords(d.text),
        text: '', translation: '', blanks: [], traps: [], rules: [], locked: tier,
      });
      fs.writeFileSync(path.join(TMP, 'practice', 'dictation', `${d.id}.json`), JSON.stringify({
        id: d.id, tier, data: d,
        audio: { keys, sealed: keys.filter(k => sealed.has(k)) },
      }));
      addSamples('practice/dictation', d.id, [d.text, d.translation, d.rules], [d.title, d.subtitle, d.theme, d.focus], 2);
    }
  }
  fs.writeFileSync(path.join(TMP, 'public', 'practice', 'dictations.json'), JSON.stringify(pubDictations));
  publishedTexts.push(JSON.stringify(pubDictations));

  // 4g. Games (server tier verification + game audio keys)
  const gamePairs = {
    story: EPISODES.flatMap(ep => [
      ...ep.beats.filter(bt => bt.k === 'say' || bt.k === 'listen').map(bt => [bt.fr, CAST[bt.who].voice]),
      ...playerLines(ep).flatMap(l => [[l, 'f'], [l, 'm']]),
    ]),
    gender: GENDER_NOUNS.map(([noun, g]) => [withArticle(noun, g), 'f']),
    numbers: Array.from({ length: 101 }, (_, n) => [numberCall(n), 'f']),
    pairs: PAIR_DECKS.flatMap(d => d.words.map(([fr]) => [fr, 'f'])),
    daily: DAILY_WORDS.map(w => [w.ex, 'f']),
  };
  for (const g of GAMES) {
    const tier = itemTierOf('game', g.id);
    const keys = collectKeys(gamePairs[g.id] || []);
    if (tier === 'visitor') {
      keys.forEach(k => alwaysPublicAudio.add(k));
    } else {
      keys.forEach(k => lockedKeys.add(k));
      fs.writeFileSync(path.join(TMP, 'practice', 'game', `${g.id}.json`), JSON.stringify({
        id: g.id, tier, data: null,
        audio: { keys, sealed: [] },
      }));
    }
  }

  // ── 5. Recordings: keep ONLY open visitor + Hub/Placement demo recordings in public audio-manifest.json ──
  const hubDemoPhrases = [
    'un croissant', 'une croissant', 'des croissant',
    'Je voudrais un café, s’il vous plaît.',
    'Je suis allé à Paris.',
  ];
  for (const k of collectKeys([
    ...PLACEMENT.filter(q => q.audio).map(q => [q.audio, 'f']),
    ...hubDemoPhrases.map(p => [p, 'f']),
  ])) alwaysPublicAudio.add(k);

  const hidden = new Set([...lockedKeys].filter(k => !openKeys.has(k) && !alwaysPublicAudio.has(k)));
  const publicManifest = {
    ...manifest,
    keys: manifest.keys.filter(k => !hidden.has(k)),
    ...(manifest.sealed ? { sealed: manifest.sealed.filter(k => !hidden.has(k)) } : {}),
  };
  fs.writeFileSync(path.join(TMP, 'public', 'audio-manifest.json'), JSON.stringify(publicManifest));
  fs.writeFileSync(path.join(TMP, 'hidden-audio.json'), JSON.stringify({ keys: [...hidden] }));

  // Example translations used by no locked lesson stay public.
  const lockedJoined = lockedTexts.join('\n');
  for (const [fr, en] of Object.entries(examples)) {
    if (!lockedJoined.includes(JSON.stringify(fr).slice(1, -1))) publicExamples[fr] = en;
  }
  fs.writeFileSync(path.join(TMP, 'public', 'example-translations.json'), JSON.stringify(publicExamples));

  // ── 6. The access lists (public: the website shows locks with them) ──
  const lists = (l) => ({
    courses: [...l.courses].sort(),
    ladders: Object.fromEntries([...l.ladders].map(([c, v]) => [c, [...v].sort()])),
    items: [...l.items].sort(),
  });
  const accessMap = { generated: true, visitor: lists(visitor), free: lists(free) };
  fs.writeFileSync(path.join(TMP, 'public', 'access.json'), JSON.stringify(accessMap));
  fs.writeFileSync(path.join(TMP, 'access.json'), JSON.stringify({ ...accessMap, generated_at: new Date().toISOString() }, null, 1));

  // ── 7. Leak samples: never a sentence that is also public somewhere ──
  const publicCorpus = [openTexts.join('\n'), publishedTexts.join('\n'), JSON.stringify(publicExamples), publicSourceText(visitor, root)].join('\n');
  const finalSamples = samples.filter(s => !publicCorpus.includes(s.text));
  fs.writeFileSync(path.join(TMP, 'leak-samples.json'), JSON.stringify(finalSamples));

  removeDir(`${OUT}.old`);
  if (fs.existsSync(OUT)) moveDir(OUT, `${OUT}.old`);
  moveDir(TMP, OUT);
  removeDir(`${OUT}.old`);

  console.log(`✓ Learn access: ${counts.visitor} lessons open to visitors, ${counts.free} with a free account, ${counts.premium} Premium`);
  console.log(`  Practice: ${practiceCounts.visitor} visitor, ${practiceCounts.free} free, ${practiceCounts.premium} Premium; ${hidden.size} recordings kept off the public list; ${finalSamples.length} leak samples (${((Date.now() - started) / 1000).toFixed(1)}s)`);
} finally {
  await vite.close();
}

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

function removeDir(dir) {
  try { fs.rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 }); } catch (err) {
    console.warn(`  (could not remove ${path.basename(dir)} yet: ${err.code}; it is replaced on the next run)`);
  }
}

/** The text of every source file the website publishes, excluding locked course and practice modules. */
function publicSourceText(visitorLists, rootDir) {
  const src = path.join(rootDir, 'src');
  const skip = new Set(['audio-manifest.json', 'example-translations.json', 'text-audio.json']);
  const parts = [];
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) { walk(p); continue; }
      if (!/\.(ts|tsx|json)$/.test(e.name) || skip.has(e.name)) continue;
      const rel = path.relative(src, p).split(path.sep).join('/');
      const cm = /^learn\/content\/courses\/(.+)\.ts$/.exec(rel);
      if (cm && !visitorLists.courses.has(cm[1])) continue;
      const tm = /^learn\/practice\/texts\/(.+)\.ts$/.exec(rel);
      if (tm && !visitorLists.items.has(`text:${tm[1]}`)) continue;
      const em = /^learn\/practice\/ear\/courses\/(.+)\.ts$/.exec(rel);
      if (em && !visitorLists.items.has(`ear:${em[1]}`)) continue;
      if (/^learn\/practice\/dialogues\/content\/.+\.ts$/.test(rel)) continue;
      if (/^learn\/practice\/(missions|missionSeries)\.ts$/.test(rel)) continue;
      if (/^learn\/practice\/dictation\/data.*\.ts$/.test(rel)) continue;
      if (/^learn\/practice\/listening\/(a1|a2|b1|b2|series2|c1|c2)\.ts$/.test(rel)) continue;
      parts.push(fs.readFileSync(p, 'utf8'));
    }
  };
  walk(src);
  return parts.join('\n');
}

/** After the build: no sentence of a locked lesson or practice item may be in the published files. */
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
    console.error(`✗ ${leaks.size} locked item(s) found in the public files:`);
    [...leaks].slice(0, 20).forEach(([l, f]) => console.error(`   ${l}  in  ${f}`));
    process.exit(1);
  }
  console.log(`✓ No locked lesson or practice content in the public files (${samples.length} samples checked).`);
}
