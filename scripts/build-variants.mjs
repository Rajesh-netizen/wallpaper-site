import sharp from 'sharp';
import { readdir, mkdir, writeFile, copyFile } from 'fs/promises';
import path from 'path';

const SRC = 'sources';
const OUT = 'public/wallpapers';
const DATA = 'data/wallpapers.json';

/**
 * Target variants. The script only generates a variant if the source
 * is at least as large — no upscaling.
 *
 * Order matters: smallest to largest.
 */
const TARGETS = [
  { device: 'phone',  label: '1080 × 1920', width: 1080, height: 1920 },
  { device: 'phone',  label: '1440 × 2560', width: 1440, height: 2560 },
  { device: 'laptop', label: '1920 × 1080', width: 1920, height: 1080 },
  { device: 'laptop', label: '2560 × 1440', width: 2560, height: 1440 },
  { device: 'laptop', label: '3840 × 2160', width: 3840, height: 2160 },
  { device: 'laptop', label: '5120 × 2880', width: 5120, height: 2880 },
  { device: 'laptop', label: '7680 × 4320', width: 7680, height: 4320 },
];

/**
 * "anime_kiminonawa-3840x2160-27358.jpg"
 *   → category: "anime"
 *   → base:     "kiminonawa"
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
    const srcW = meta.width ?? 0;
    const srcH = meta.height ?? 0;

    console.log(`\n▸ ${file}`);
    console.log(`  Source: ${srcW} × ${srcH}  [${category}]`);

    const variants = [];

    // ---- Sized variants ----
    for (const t of TARGETS) {
      // skip if the source is smaller than the target in BOTH dimensions
      if (srcW < t.width && srcH < t.height) continue;

      const filename = `${t.device}-${t.width}x${t.height}.webp`;
      const outPath = path.join(outDir, filename);

      await sharp(srcPath)
        .resize(t.width, t.height, {
          fit: 'cover',
          position: sharp.strategy.attention,
        })
        .webp({ quality: 100, effort: 6 })
        .toFile(outPath);

      const { size } = await import('fs').then((fs) =>
        fs.promises.stat(outPath)
      );

      variants.push({
        device: t.device,
        label: t.label,
        width: t.width,
        height: t.height,
        path: `/wallpapers/${base}/${filename}`,
      });

      console.log(
        `  ✓ ${t.label.padEnd(12)} → ${(size / 1024 / 1024).toFixed(2)} MB`
      );
    }

    // ---- Original — untouched ----
    // If the source is JPEG or PNG, copy it byte-for-byte so the user
    // can download the exact file you uploaded.
    // If it's WebP, we re-encode at quality 100 (near-lossless).
    const ext = path.extname(file).toLowerCase().slice(1);
    const originalFilename = `original.${ext}`;
    const originalOut = path.join(outDir, originalFilename);

    if (ext === 'webp') {
      await sharp(srcPath)
        .webp({ quality: 100, effort: 6 })
        .toFile(originalOut);
    } else {
      await copyFile(srcPath, originalOut);
    }

    const { size: origSize } = await import('fs').then((fs) =>
      fs.promises.stat(originalOut)
    );

    variants.push({
      device: 'original',
      label: `Original — ${srcW} × ${srcH}`,
      width: srcW,
      height: srcH,
      path: `/wallpapers/${base}/${originalFilename}`,
    });

    console.log(
      `  ✓ Original      → ${(origSize / 1024 / 1024).toFixed(2)} MB`
    );

    index.push({
      slug: base,
      title: titleFromSlug(base),
      category,
      variants,
    });
  }

  await writeFile(DATA, JSON.stringify(index, null, 2));
  console.log(`\n${index.length} wallpapers indexed.\n`);
}

build().catch((e) => {
  console.error(e);
  process.exit(1);
});