import sharp from 'sharp';
import { readdir, mkdir, writeFile } from 'fs/promises';
import path from 'path';

const SRC = 'sources';
const OUT = 'public/wallpapers';
const DATA = 'data/wallpapers.json';

const TARGETS = [
  { device: 'phone',  label: '1080 × 1920', width: 1080, height: 1920 },
  { device: 'phone',  label: '1440 × 2560', width: 1440, height: 2560 },
  { device: 'laptop', label: '1920 × 1080', width: 1920, height: 1080 },
  { device: 'laptop', label: '2560 × 1440', width: 2560, height: 1440 },
  { device: 'laptop', label: '3840 × 2160', width: 3840, height: 2160 },
];

/**
 * "anime_kiminonawa-3840x2160-27358.jpg"
 *   → category: "anime"
 *   → base:     "kiminonawa"
 *
 * Uses the FIRST single underscore as the separator.
 * Then strips a trailing "-<w>x<h>-<id>" that download tools add.
 */
function parseFilename(filename) {
  const stem = filename.replace(/\.[^.]+$/, '');
  const firstUnderscore = stem.indexOf('_');

  let category = 'uncategorized';
  let base = stem;

  if (firstUnderscore > 0) {
    category = stem.slice(0, firstUnderscore);
    base = stem.slice(firstUnderscore + 1);
  }

  base = base.replace(/-\d{3,5}x\d{3,5}-\d+$/i, '');

  return { category: slug(category), base: slug(base) };
}

function slug(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function titleFromSlug(s) {
  return s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

async function build() {
  await mkdir(OUT, { recursive: true });
  await mkdir('data', { recursive: true });

  const files = (await readdir(SRC, { withFileTypes: true }))
    .filter((d) => d.isFile() && /\.(jpe?g|png|webp)$/i.test(d.name))
    .map((d) => d.name);

  const index = [];

  for (const file of files) {
    const { category, base } = parseFilename(file);
    const srcPath = path.join(SRC, file);
    const outDir = path.join(OUT, base);
    await mkdir(outDir, { recursive: true });

    const meta = await sharp(srcPath).metadata();
    const variants = [];

    for (const t of TARGETS) {
      if ((meta.width ?? 0) < t.width && (meta.height ?? 0) < t.height) continue;

      const filename = `${t.device}-${t.width}x${t.height}.webp`;
      const outPath = path.join(outDir, filename);

      await sharp(srcPath)
        .resize(t.width, t.height, {
          fit: 'cover',
          position: sharp.strategy.attention,
        })
        .webp({ quality: 85 })
        .toFile(outPath);

      variants.push({
        device: t.device,
        label: t.label,
        width: t.width,
        height: t.height,
        path: `/wallpapers/${base}/${filename}`,
      });
    }

    index.push({
      slug: base,
      title: titleFromSlug(base),
      category,
      variants,
    });

    console.log(`✓ ${base}  [${category}]  — ${variants.length} variants`);
  }

  await writeFile(DATA, JSON.stringify(index, null, 2));
  console.log(`\nDone. ${index.length} wallpapers indexed.`);
}

build().catch((e) => {
  console.error(e);
  process.exit(1);
});