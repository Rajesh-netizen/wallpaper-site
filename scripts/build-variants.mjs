import sharp from 'sharp';
import { readdir, mkdir, writeFile, copyFile, stat } from 'fs/promises';
import path from 'path';

const SRC = 'sources';
const OUT = 'public/wallpapers';
const DATA = 'data/wallpapers.json';

/** Which folders exist and what device variants to generate from each. */
const FOLDERS = [
  { dir: 'both',   devices: ['phone', 'laptop'] },
  { dir: 'phone',  devices: ['phone'] },
  { dir: 'laptop', devices: ['laptop'] },
];

/** All possible targets — the script filters by device per folder. */
const TARGETS = [
  { device: 'phone',  label: '1080 × 1920', width: 1080, height: 1920 },
  { device: 'phone',  label: '1440 × 2560', width: 1440, height: 2560 },
  { device: 'laptop', label: '1920 × 1080', width: 1920, height: 1080 },
  { device: 'laptop', label: '2560 × 1440', width: 2560, height: 1440 },
  { device: 'laptop', label: '3840 × 2160', width: 3840, height: 2160 },
  { device: 'laptop', label: '5120 × 2880', width: 5120, height: 2880 },
];

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

async function collectFiles() {
  /** Returns [{ file, srcPath, folder, devices[] }] */
  const jobs = [];

  // First, files sitting directly in sources/ — treat as "both"
  const rootFiles = await readdir(SRC, { withFileTypes: true });
  for (const d of rootFiles) {
    if (d.isFile() && /\.(jpe?g|png|webp)$/i.test(d.name)) {
      jobs.push({
        file: d.name,
        srcPath: path.join(SRC, d.name),
        folder: 'both',
        devices: ['phone', 'laptop'],
      });
    }
  }

  // Then, files inside each subfolder
  for (const f of FOLDERS) {
    const dirPath = path.join(SRC, f.dir);
    try {
      const entries = await readdir(dirPath, { withFileTypes: true });
      for (const d of entries) {
        if (d.isFile() && /\.(jpe?g|png|webp)$/i.test(d.name)) {
          jobs.push({
            file: d.name,
            srcPath: path.join(dirPath, d.name),
            folder: f.dir,
            devices: f.devices,
          });
        }
      }
    } catch {
      // folder doesn't exist — skip
    }
  }

  return jobs;
}

async function build() {
  await mkdir(OUT, { recursive: true });
  await mkdir('data', { recursive: true });

  const jobs = await collectFiles();
  const index = [];

  for (const job of jobs) {
    const { file, srcPath, folder, devices } = job;
    const { category, base } = parseFilename(file);
    const outDir = path.join(OUT, base);
    await mkdir(outDir, { recursive: true });

    const meta = await sharp(srcPath).metadata();
    const srcW = meta.width ?? 0;
    const srcH = meta.height ?? 0;
    const orientation = srcW >= srcH ? 'landscape' : 'portrait';

    console.log(`\n▸ [${folder}] ${file}`);
    console.log(`  Source: ${srcW} × ${srcH} (${orientation})`);

    // Warn if a "phone" folder file is landscape or vice versa
    if (folder === 'phone' && orientation === 'landscape') {
      console.log(`  ⚠ Warning: this is landscape but in the phone folder`);
    }
    if (folder === 'laptop' && orientation === 'portrait') {
      console.log(`  ⚠ Warning: this is portrait but in the laptop folder`);
    }

    const variants = [];

    // ---- Sized variants ----
    for (const t of TARGETS) {
      if (!devices.includes(t.device)) continue;

      // Skip if the source is smaller than the target in BOTH dimensions
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

      const { size } = await stat(outPath);

      variants.push({
        device: t.device,
        label: t.label,
        width: t.width,
        height: t.height,
        path: `/wallpapers/${base}/${filename}`,
      });

      console.log(
        `  ✓ ${t.device} ${t.label.padEnd(11)} → ${(size / 1024 / 1024).toFixed(2)} MB`
      );
    }

    // ---- Original — untouched ----
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

    const { size: origSize } = await stat(originalOut);

    variants.push({
      device: 'original',
      label: `Original — ${srcW} × ${srcH}`,
      width: srcW,
      height: srcH,
      path: `/wallpapers/${base}/${originalFilename}`,
    });

    console.log(
      `  ✓ original       → ${(origSize / 1024 / 1024).toFixed(2)} MB`
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