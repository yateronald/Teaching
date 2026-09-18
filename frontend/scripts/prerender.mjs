// Pre-renders the public landing page after `vite build`:
//   dist/index.html     → English  (https://www.learnfrenchwithnatives.com/)
//   dist/fr/index.html  → French   (https://www.learnfrenchwithnatives.com/fr/)
//   dist/sitemap.xml    → both pages with hreflang, dated with this build
//
// Search engines, social networks and AI crawlers then receive the full page,
// its title, meta tags, hreflang and JSON-LD without running JavaScript.
// A failure here never breaks a deployment: the SPA still works, only the
// pre-rendered HTML is skipped (and a warning is printed).
import { build } from 'vite';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const cache = path.join(root, 'node_modules', '.cache', 'prerender');
const SITE = 'https://www.learnfrenchwithnatives.com';
const PAGES = [
  { lang: 'en', file: 'index.html', url: `${SITE}/` },
  { lang: 'fr', file: path.join('fr', 'index.html'), url: `${SITE}/fr/` },
];

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

function sitemap(date) {
  const alternates = PAGES.map(p => `    <xhtml:link rel="alternate" hreflang="${p.lang}" href="${p.url}" />`)
    .concat(`    <xhtml:link rel="alternate" hreflang="x-default" href="${PAGES[0].url}" />`).join('\n');
  const urls = PAGES.map(p => `  <url>
    <loc>${p.url}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
${alternates}
  </url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;
}

async function main() {
  const started = Date.now();
  const template = await fs.readFile(path.join(dist, 'index.html'), 'utf8');
  if (!template.includes('<!--app-html-->')) throw new Error('dist/index.html has no <!--app-html--> placeholder');

  await build({
    root,
    logLevel: 'error',
    configFile: path.join(root, 'vite.config.ts'),
    build: { ssr: 'src/entry-prerender.tsx', outDir: cache, emptyOutDir: true, copyPublicDir: false },
    ssr: { noExternal: true },
  });
  const { render } = await import(pathToFileURL(path.join(cache, 'entry-prerender.js')).href);

  // Render everything first: either all pages are written, or none.
  const outputs = PAGES.map(page => {
    const { head, body } = splitHead(render(page.lang));
    if (!/<h1\b/.test(body)) throw new Error(`the ${page.lang} page rendered without its <h1>`);
    const html = template
      .replace(/<html lang="[^"]*">/, `<html lang="${page.lang}">`)
      .replace(/<title>[^<]*<\/title>\s*/, '')
      .replace('<!--app-head-->', head)
      .replace('<!--app-html-->', body);
    return { ...page, html };
  });
  for (const out of outputs) {
    const target = path.join(dist, out.file);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, out.html);
  }
  await fs.writeFile(path.join(dist, 'sitemap.xml'), sitemap(new Date().toISOString().slice(0, 10)));
  await fs.rm(cache, { recursive: true, force: true });
  console.log(`✓ Pre-rendered ${outputs.map(o => '/' + o.file.replace(/\\/g, '/').replace('index.html', '')).join(', ')} and sitemap.xml in ${((Date.now() - started) / 1000).toFixed(1)}s`);
}

main().catch(err => {
  console.warn(`⚠ Pre-rendering skipped: ${err && err.message ? err.message : err}`);
  console.warn('  The site still works; search engines will receive the client-rendered page.');
});
