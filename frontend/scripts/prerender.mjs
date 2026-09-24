// Pre-renders the public pages after `vite build`:
//   dist/index.html              → English home   (https://www.learnfrenchwithnatives.com/)
//   dist/fr/index.html           → French home    (https://www.learnfrenchwithnatives.com/fr/)
//   dist/<topic>/index.html      → one page per exam or course, in both languages
//                                  (the list is PUBLIC_PAGES in src/components/Landing/sitePages.ts)
//   dist/404.html                → "page not found", sent by nginx with a 404 status
//                                  for unknown addresses (deploy/serve-real-404.sh)
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
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

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
    <priority>${p.topic ? '0.8' : '1.0'}</priority>
${alternates}
  </url>`;
  }).join('\n');
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
  const { render, renderNotFound, PUBLIC_PAGES } = await import(pathToFileURL(path.join(cache, 'entry-prerender.js')).href);

  // data-page tells index.html which address a file was made for: served for
  // any other address (the signed-in app), its content is hidden. The 404 page
  // is made for every address that is not a page, hence '*'.
  const toHtml = (rendered, lang, dataPage, name) => {
    const { head, body } = splitHead(rendered);
    if (!/<h1\b/.test(body)) throw new Error(`${name} rendered without its <h1>`);
    return template
      .replace(/<html lang="[^"]*">/, `<html lang="${lang}" data-page="${dataPage}">`)
      .replace(/<title>[^<]*<\/title>\s*/, '')
      .replace('<!--app-head-->', head)
      .replace('<!--app-html-->', body);
  };

  // Render everything first: either all pages are written, or none.
  const outputs = PUBLIC_PAGES.map(page => ({
    ...page,
    file: fileFor(page.path),
    html: toHtml(render(page), page.lang, page.path, page.path),
  }));
  // Not in the sitemap: nginx sends it, with a 404 status, for unknown addresses.
  outputs.push({ path: '404', file: '404.html', html: toHtml(renderNotFound(), 'en', '*', '404.html') });

  // Each page carries, inline, the CSS rules its own HTML uses; the full
  // stylesheet then loads without holding back the first paint. It stays in
  // dist/assets unchanged: the signed-in app and the other pages still use it.
  const beasties = new Beasties({
    path: dist,
    publicPath: '/',
    preload: 'media',        // <link media="print" onload="this.media='all'"> + <noscript> fallback
    pruneSource: false,
    reduceInlineStyles: false, // keep the @font-face block of index.html as written
    fonts: false,              // fonts are preloaded by index.html already
    logLevel: 'warn',
  });
  for (const out of outputs) out.html = await beasties.process(out.html);
  for (const out of outputs) {
    const target = path.join(dist, out.file);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, out.html);
  }
  await fs.writeFile(path.join(dist, 'sitemap.xml'), sitemap(PUBLIC_PAGES, new Date().toISOString().slice(0, 10)));
  await fs.rm(cache, { recursive: true, force: true });
  console.log(`✓ Pre-rendered ${outputs.length} pages (${outputs.map(o => o.path).join(', ')}) and sitemap.xml in ${((Date.now() - started) / 1000).toFixed(1)}s`);
}

main().catch(err => {
  console.warn(`⚠ Pre-rendering skipped: ${err && err.message ? err.message : err}`);
  console.warn('  The site still works; search engines will receive the client-rendered page.');
});
