// Compress the generated editorial illustrations without changing their content.
// Usage: node scripts/prepare-landing-images.mjs [path-to-sharp-module] [asset-name]
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const sharp = require(process.argv[2] || 'sharp');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const assets = path.join(root, 'frontend/src/assets/landing');
const variants = [['french-lesson-v1', [720, 1200]], ['exam-study-v1', [640, 1000]], ['french-study-hero-v2', [720, 1200]], ['french-study-hero-indian-v3', [720, 1200]], ['french-study-hero-indian-v4', [720, 1200]]];
for (const [name, widths] of variants.filter(([name]) => !process.argv[3] || name === process.argv[3])) {
  for (const width of widths) {
    const output = path.join(assets, `${name}-${width}.webp`);
    const info = await sharp(path.join(root, 'output/imagegen/landing', `${name}.png`))
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 82, effort: 6 })
      .toFile(output);
    console.log(`${path.basename(output)}: ${info.width} × ${info.height}, ${Math.round(info.size / 1024)} KB`);
  }
}
