// Worker for scripts/prerender.mjs: inlines each page's critical CSS
// (beasties) and writes the page. This is ~90 % of the pre-render time and
// every page is independent, so several workers share it.
import { parentPort, workerData } from 'node:worker_threads';
import Beasties from 'beasties';
import fs from 'node:fs/promises';
import path from 'node:path';

const beasties = new Beasties(workerData.options);

parentPort.on('message', async ({ id, html, target }) => {
  const t = performance.now();
  try {
    const out = await beasties.process(html);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, out);
    parentPort.postMessage({ id, ok: true, ms: performance.now() - t });
  } catch (err) {
    parentPort.postMessage({ id, ok: false, error: err && err.message ? err.message : String(err) });
  }
});
