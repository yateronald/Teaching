// Pre-renders the public pages after `vite build`:
//   dist/index.html              → English home   (https://www.learnfrenchwithnatives.com/)
//   dist/fr/index.html           → French home    (https://www.learnfrenchwithnatives.com/fr/)
//   dist/<topic>/index.html      → one page per exam or course, in both languages
//                                  (the list is PUBLIC_PAGES in src/components/Landing/sitePages.ts)
//   dist/404.html                → "page not found", sent by nginx with a 404 status
//                                  for unknown addresses (deploy/serve-real-404.sh)
//   dist/learn/…, dist/fr/apprendre/… → the indexable learn SEO pages: hub, paths,
//                                  courses, lessons, level test, practice (src/learn/ssr.ts)
//   dist/sitemap.xml             → every page with its hreflang alternates, dated with this build
//
// Search engines, social networks and AI crawlers then receive the full page,
// its title, meta tags, hreflang and JSON-LD without running JavaScript.
// Each page is rendered through the app's own routes (SiteRoutes), so the
// browser hydrates it instead of drawing it again, and it carries its critical
// CSS inline (beasties) so no stylesheet request holds back the first paint.
// A failure here never breaks a deployment: the SPA still works, only the
// pre-rendered HTML is skipped (and a warning is printed).
import { build } from 'vite';
import Beasties from 'beasties';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Worker } from 'node:worker_threads';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const cache = path.join(root, 'node_modules', '.cache', 'prerender');
const SITE = 'https://www.learnfrenchwithnatives.com';

/** '/' → index.html, '/fr/preparation-tcf-canada/' → fr/preparation-tcf-canada/index.html */
const fileFor = urlPath => path.join(...urlPath.split('/').filter(Boolean), 'index.html');

/** React 19 emits hoisted head tags (title, meta, link) first; split them from the page body. */
function splitHead(html) {
  const tags = [];
  let rest = html;
  const HEAD_TAG = /^(<(?:link|meta)\b[^>]*\/?>|<title\b[^>]*>[\s\S]*?<\/title>)/;
  for (let m = rest.match(HEAD_TAG); m; m = rest.match(HEAD_TAG)) {
    // Marked so the client can drop them before React re-inserts its own copies.
    tags.push(m[1].replace(/^<(\w+)/, '<$1 data-prerender=""').replace(' hrefLang=', ' hreflang='));
    rest = rest.slice(m[1].length);
  }
  return { head: tags.join('\n    '), body: rest };
}

function sitemap(pages, date) {
  const urls = pages.map(p => {
    const alternates = Object.entries(p.alternates)
      .map(([lang, href]) => `    <xhtml:link rel="alternate" hreflang="${lang}" href="${SITE}${href}" />`)
      .concat(`    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}${p.alternates.en}" />`)
      .join('\n');
    return `  <url>
    <loc>${SITE}${p.path}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${p.priority ?? (p.topic ? '0.8' : '1.0')}</priority>
${alternates}
  </url>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;
}

const staging = path.join(dist, '.prerender-staging');
const secondsSince = t => ((Date.now() - t) / 1000).toFixed(1);

async function runLimited(items, concurrency, fn) {
  let idx = 0;
  async function worker() {
    while (idx < items.length) {
      const item = items[idx++];
      await fn(item);
    }
  }
  const n = Math.min(concurrency, Math.max(1, items.length));
  await Promise.all(Array.from({ length: n }, () => worker()));
}

/**
 * Pick one representative learn page per route template (hub, category, level,
 * course, lesson, reading, listening, dictation, games, placement) so Beasties
 * can compute the union of learn-shell critical CSS in a single pass.
 */
function pickLearnRepresentatives(learnPages) {
  const picked = [];
  const seen = new Set();
  const add = p => {
    if (!p || seen.has(p.path)) return;
    seen.add(p.path);
    picked.push(p);
  };

  add(learnPages.find(p => p.path === '/learn/'));
  add(learnPages.find(p => p.path === '/learn/practice/'));
  add(learnPages.find(p => p.path === '/learn/practice/reading/'));
  add(learnPages.find(p => p.path === '/learn/practice/listening/'));
  add(learnPages.find(p => p.path === '/learn/practice/dictation/'));
  add(learnPages.find(p => p.path === '/learn/games/'));
  add(learnPages.find(p => p.path === '/learn/placement/'));
  add(learnPages.find(p => p.path.startsWith('/learn/level/')));
  add(learnPages.find(p => {
    const segs = p.path.split('/').filter(Boolean);
    return segs[0] === 'learn' && segs.length === 2 && !['practice', 'games', 'placement', 'level'].includes(segs[1]);
  }));
  add(learnPages.find(p => {
    const segs = p.path.split('/').filter(Boolean);
    return segs[0] === 'learn' && segs.length === 3 && !['practice', 'games', 'level'].includes(segs[1]);
  }));
  add(learnPages.find(p => {
    const segs = p.path.split('/').filter(Boolean);
    return segs[0] === 'learn' && segs.length === 4 && !['practice', 'games', 'level'].includes(segs[1]);
  }));
  add(learnPages.find(p => p.path.startsWith('/learn/practice/reading/') && p.path !== '/learn/practice/reading/'));
  return picked.slice(0, 10);
}

/**
 * Compute shared critical CSS once across representative learn page bodies and
 * return a pre-transformed HTML template, or null to fall back to full Beasties.
 */
async function buildLearnTemplate(template, representatives, render, beastiesOptions) {
  if (!representatives.length) return null;
  const cssLinks = template.match(/<link\b(?=[^>]*\brel=["']stylesheet["'])(?=[^>]*\bhref=["']\/assets\/[^"']+\.css["'])[^>]*>/gi) || [];
  if (cssLinks.length !== 1) return null;
  const hrefMatch = cssLinks[0].match(/\bhref=["']([^"']+)["']/i);
  if (!hrefMatch) return null;

  const bodies = representatives.map(p => splitHead(render(p)).body);
  const unionHtml = template
    .replace(/<html lang="[^"]*">/, '<html lang="en">')
    .replace('<!--app-head-->', '')
    .replace('<!--app-html-->', bodies.join('\n'));

  const processed = await new Beasties(beastiesOptions).process(unionHtml);
  const headMatch = processed.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i);
  if (!headMatch) return null;

  const critMatch = headMatch[1].match(
    /(?:<style>(?:(?!<\/style>)[\s\S])*?<\/style>\s*)?<link\b(?=[^>]*\brel=["']stylesheet["'])(?=[^>]*\bmedia=["']print["'])[^>]*>(?:\s*<noscript>[\s\S]*?<\/noscript>)?/i,
  );
  if (!critMatch) return null;

  const snippet = critMatch[0];
  if (!snippet.includes('<style>') || !/\bmedia=["']print["']/i.test(snippet) || snippet.includes('.app-route') || !snippet.includes(hrefMatch[1])) {
    return null;
  }
  return template.replace(cssLinks[0], snippet);
}

/**
 * Inlining each page's critical CSS is ~90 % of the pre-render time and every
 * page is independent: worker threads share it (same options, same output as
 * one thread). PRERENDER_WORKERS sets their number; 0 = in this thread.
 */
function cssPool(options, jobCount) {
  const wanted = process.env.PRERENDER_WORKERS;
  const cores = typeof os.availableParallelism === 'function' ? os.availableParallelism() : os.cpus().length;
  const maxDefault = jobCount <= 40 ? Math.min(cores, 4, Math.max(1, Math.ceil(jobCount / 8))) : Math.min(cores, 8);
  const n = wanted !== undefined && wanted !== '' ? Math.max(0, Number(wanted) || 0) : maxDefault;

  if (n === 0) {
    const beasties = new Beasties(options);
    return {
      size: 0,
      async process(html, target) {
        const t = performance.now();
        const out = await beasties.process(html);
        await fs.mkdir(path.dirname(target), { recursive: true });
        await fs.writeFile(target, out);
        return performance.now() - t;
      },
      close: async () => {},
    };
  }

  const workers = Array.from({ length: n }, () =>
    new Worker(new URL('./prerender-css-worker.mjs', import.meta.url), { workerData: { options } }));
  const idle = [...workers];
  const waiting = [];          // callers waiting for a free worker
  const pending = new Map();   // message id → { resolve, reject }
  let seq = 0;
  let broken = null;
  let closing = false;
  const fail = err => {
    if (broken) return;
    broken = err;
    for (const p of pending.values()) p.reject(err);
    pending.clear();
    for (const r of waiting.splice(0)) r(null);   // nobody waits forever on a dead pool
  };
  for (const w of workers) {
    w.on('message', ({ id, ok, ms, error }) => {
      const p = pending.get(id);
      pending.delete(id);
      const next = waiting.shift();
      if (next) next(w); else idle.push(w);
      if (!p) return;
      if (ok) p.resolve(ms); else p.reject(new Error(error));
    });
    w.on('error', fail);
    w.on('exit', code => { if (!closing && code !== 0) fail(new Error(`a pre-render worker stopped (code ${code})`)); });
  }
  const acquire = () => (idle.length ? Promise.resolve(idle.pop()) : new Promise(r => waiting.push(r)));
  return {
    size: n,
    /** Resolves once a worker has taken the page; `done` settles when it is written. */
    async submit(html, target) {
      if (broken) throw broken;
      const w = await acquire();
      if (broken || !w) throw broken ?? new Error('pre-render workers unavailable');
      const id = ++seq;
      const done = new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
      w.postMessage({ id, html, target });
      return { done };
    },
    close: () => { closing = true; return Promise.all(workers.map(w => w.terminate())); },
  };
}

async function main() {
  const started = Date.now();
  const template = await fs.readFile(path.join(dist, 'index.html'), 'utf8');
  if (!template.includes('<!--app-html-->')) throw new Error('dist/index.html has no <!--app-html--> placeholder');

  console.log('▸ Pre-rendering: building the server bundle…');
  await build({
    root,
    logLevel: 'error',
    configFile: path.join(root, 'vite.config.ts'),
    build: { ssr: 'src/entry-prerender.tsx', outDir: cache, emptyOutDir: true, copyPublicDir: false },
    ssr: { noExternal: true },
  });
  const { render, renderNotFound, PUBLIC_PAGES, prepare, LEARN_PAGES } = await import(pathToFileURL(path.join(cache, 'entry-prerender.js')).href);
  for (const w of prepare()) console.warn(`  ⚠ learn: ${w}`);
  // Only pre-render indexable learn SEO pages; sitemap: false app/account routes hydrate via SPA fallback.
  const learn = LEARN_PAGES().filter(p => p.sitemap !== false);
  const pages = [...PUBLIC_PAGES, ...learn];
  console.log(`  server bundle ready in ${secondsSince(started)}s`);

  // data-page tells index.html which address a file was made for: served for
  // any other address (the signed-in app), its content is hidden. The 404 page
  // is made for every address that is not a page, hence '*'.
  const toHtml = (baseTemplate, rendered, lang, dataPage, name, beastiesAttr = '') => {
    const { head, body } = splitHead(rendered);
    if (!/<h1\b/.test(body)) throw new Error(`${name} rendered without its <h1>`);
    return baseTemplate
      .replace(/<html lang="[^"]*">/, `<html lang="${lang}" data-page="${dataPage}"${beastiesAttr}>`)
      .replace(/<title>[^<]*<\/title>\s*/, '')
      .replace('<!--app-head-->', head)
      .replace('<!--app-html-->', body);
  };

  const beastiesOptions = {
    path: dist,
    publicPath: '/',
    preload: 'media',        // <link media="print" onload="this.media='all'"> + <noscript> fallback
    pruneSource: false,
    reduceInlineStyles: false, // keep the @font-face block of index.html as written
    fonts: false,              // fonts are preloaded by index.html already
    logLevel: 'warn',
  };

  const fullBeasties = process.env.PRERENDER_FULL_BEASTIES === '1';
  const learnTemplate = fullBeasties
    ? null
    : await buildLearnTemplate(template, pickLearnRepresentatives(learn), render, beastiesOptions);

  const publicJobs = PUBLIC_PAGES.map(page => ({
    path: page.path,
    file: fileFor(page.path),
    make: () => toHtml(template, render(page), page.lang, page.path, page.path),
  }));
  publicJobs.push({
    path: '404',
    file: '404.html',
    make: () => toHtml(template, renderNotFound(), 'en', '*', '404.html'),
  });

  const learnJobs = learn.map(page => ({
    path: page.path,
    file: fileFor(page.path),
    make: () => toHtml(
      learnTemplate ?? template,
      render(page),
      page.lang,
      page.path,
      page.path,
      learnTemplate ? ' data-beasties-container' : '',
    ),
  }));

  const beastiesJobs = learnTemplate ? publicJobs : [...publicJobs, ...learnJobs];
  const fastLearnJobs = learnTemplate ? learnJobs : [];
  const allJobs = [...publicJobs, ...learnJobs];
  const total = allJobs.length;

  await fs.rm(staging, { recursive: true, force: true });
  const renderStart = Date.now();
  let lastReport = renderStart;
  let msRender = 0, msCss = 0, finished = 0, failure = null;
  const report = () => {
    if (finished !== total && finished % 500 !== 0 && Date.now() - lastReport <= 15000) return;
    lastReport = Date.now();
    const elapsed = (Date.now() - renderStart) / 1000;
    const left = finished ? Math.round((elapsed / finished) * (total - finished)) : 0;
    console.log(`  ${finished}/${total} pages · ${elapsed.toFixed(0)}s${finished < total ? ` · about ${left}s left` : ''}`);
  };

  const pool = cssPool(beastiesOptions, beastiesJobs.length);
  console.log(
    `▸ Pre-rendering ${total} pages (${publicJobs.length} full Beasties via ${pool.size || 1} thread${pool.size === 1 || !pool.size ? '' : 's'}` +
    `${learnTemplate ? ` + ${fastLearnJobs.length} shared learn critical-CSS` : ''})…`,
  );

  try {
    const inFlight = [];
    for (const job of beastiesJobs) {
      if (failure) throw failure;
      const t = performance.now();
      const raw = job.make();
      msRender += performance.now() - t;
      const target = path.join(staging, job.file);
      if (pool.size === 0) {
        msCss += await pool.process(raw, target);
        finished++; report();
        continue;
      }
      const { done } = await pool.submit(raw, target);
      inFlight.push(done.then(ms => { msCss += ms; finished++; report(); }, err => { failure ??= err; }));
    }
    await Promise.all(inFlight);
    if (failure) throw failure;
  } finally {
    await pool.close();
  }

  if (fastLearnJobs.length > 0) {
    await runLimited(fastLearnJobs, 64, async (job) => {
      const t = performance.now();
      const html = job.make();
      msRender += performance.now() - t;
      const target = path.join(staging, job.file);
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, html);
      finished++; report();
    });
  }

  // All pages rendered: move them into place.
  await runLimited(allJobs, 32, async (job) => {
    const target = path.join(dist, job.file);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.rename(path.join(staging, job.file), target);
  });

  await fs.rm(staging, { recursive: true, force: true });
  await fs.writeFile(path.join(dist, 'sitemap.xml'), sitemap(pages.filter(p => p.sitemap !== false), new Date().toISOString().slice(0, 10)));
  await fs.rm(cache, { recursive: true, force: true });
  const listed = publicJobs.map(o => o.path).join(', ');
  const s = ms => (ms / 1000).toFixed(0);
  console.log(`  rendering ${s(msRender)}s · inlining CSS + writing ${s(msCss)}s`);
  console.log(`✓ Pre-rendered ${total} pages (${listed}, and ${learn.length} learn SEO pages) and sitemap.xml in ${secondsSince(started)}s`);
}

main().catch(async err => {
  // A half-finished run leaves nothing behind: the pages already in dist stay as they were.
  await fs.rm(staging, { recursive: true, force: true }).catch(() => {});
  console.warn(`⚠ Pre-rendering skipped: ${err && err.message ? err.message : err}`);
  console.warn('  The site still works; search engines will receive the client-rendered page.');
});
