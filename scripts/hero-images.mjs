/**
 * Builds the responsive hero image set from large originals (≥ 4000 px wide).
 *
 *   node scripts/hero-images.mjs <source-dir>
 *
 * Each <name>.jpg in <source-dir> becomes three art-directed crops, each at
 * several widths, in AVIF and WebP:
 *   <name>-desktop-{1280,1920,2560}  16:9, desktops and landscape screens
 *   <name>-tablet-{1024,1600}        3:4, portrait tablets
 *   <name>-mobile-{640,1080}         9:16, portrait phones
 * Width lists must match HERO_VARIANTS in src/components/Hero.jsx.
 */
import { mkdir, readdir } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';
import sharp from 'sharp';

const OUT_DIR = 'public/images/hero';
const VARIANTS = {
  desktop: { ratio: 16 / 9, widths: [1280, 1920, 2560] },
  tablet: { ratio: 3 / 4, widths: [1024, 1600] },
  mobile: { ratio: 9 / 16, widths: [640, 1080] },
};
// Smart cropping picks the busiest area; pin photos where that isn't the person
const FOCUS = { tailored: 'centre' };

const sourceDir = process.argv[2];
if (!sourceDir) {
  console.error('Usage: node scripts/hero-images.mjs <source-dir>');
  process.exit(1);
}

await mkdir(OUT_DIR, { recursive: true });
const files = (await readdir(sourceDir)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));

for (const file of files) {
  const name = basename(file, extname(file));
  const source = sharp(join(sourceDir, file));
  for (const [variant, { ratio, widths }] of Object.entries(VARIANTS)) {
    for (const width of widths) {
      const resized = source.clone().resize(width, Math.round(width / ratio), {
        fit: 'cover',
        position: FOCUS[name] ?? 'attention',
      });
      const base = join(OUT_DIR, `${name}-${variant}-${width}`);
      await resized.clone().avif({ quality: 50, effort: 6 }).toFile(`${base}.avif`);
      await resized.clone().webp({ quality: 72 }).toFile(`${base}.webp`);
    }
  }
  console.log(`hero-images: ${name}`);
}
