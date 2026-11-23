// Vite plugin: copy public/ into dist/ EXCEPT public/learn/ (17,343 audio/image/text
// files, ~494 MB), which are served from Cloudflare R2 in production and directly from
// public/ during `vite dev`. Pass COPY_LEARN_MEDIA=1 to include them in dist/.
import fs from 'node:fs';
import path from 'node:path';

export default function copyPublicWithoutLearnMedia() {
  let isSsr = false;
  let publicDir = '';
  let outDir = '';
  const includeLearnMedia = process.env.COPY_LEARN_MEDIA === '1';

  return {
    name: 'lfwn-copy-public-without-learn-media',
    apply: 'build',
    configResolved(config) {
      isSsr = Boolean(config.build.ssr);
      publicDir = typeof config.publicDir === 'string' ? config.publicDir : '';
      outDir = path.resolve(config.root, config.build.outDir);
    },
    writeBundle() {
      if (isSsr || !publicDir || !fs.existsSync(publicDir)) return;
      fs.mkdirSync(outDir, { recursive: true });
      for (const entry of fs.readdirSync(publicDir, { withFileTypes: true })) {
        if (!includeLearnMedia && entry.name === 'learn') continue;
        fs.cpSync(path.join(publicDir, entry.name), path.join(outDir, entry.name), {
          recursive: true,
          force: true,
        });
      }
    },
  };
}
