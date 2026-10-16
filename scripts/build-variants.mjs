import sharp from 'sharp';
import {
  readdir,
  mkdir,
  writeFile,
  copyFile,
  stat,
  unlink,
  readFile,
} from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const SRC = 'sources';
const OUT = 'public/wallpapers';
const DATA = 'data/wallpapers.json';
const PROCESSED = 'data/processed.json';

const MAX_FILE_MB = 24;
const FALLBACK_QUALITIES = [95, 92, 88, 85, 80, 75];

const FOLDERS = [
  { dir: 'both',   devices: ['phone', 'laptop'] },
  { dir: 'phone',  devices: ['phone'] },
  { dir: 'laptop', devices: ['laptop'] },
];

const TARGETS = [
  { device: 'phone',  label: '1080 × 1920', width: 1080, height: 1920 },
  { device: 'phone',  label: '1440 × 2560', width: 1440, height: 2560 },
  { device: 'laptop', label: '1920 × 1080', width: 1920, height: 1080 },
  { device: 'laptop', label: '2560 × 1440', width: 2560, height: 1440 },
  { device: 'laptop', label: '3840 × 2160', width: 3840, height: 2160 },
  { device: 'laptop', label: '5120 × 2880', width: 5120, height: 2880 },
];

// ---------- helpers ----------
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

async function readJsonSafe(p, fallback) {
  try {
    const raw = await readFile(p, 'utf8');
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

async function collectFiles() {
  const jobs = [];

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
    } catch {}
  }

  return jobs;
}

/**
 * Produce an "original" variant. Copy byte-for-byte if small enough.
 * If over MAX_FILE_MB, re-encode as WebP at decreasing quality until
 * it fits. Returns null if it can't fit.
 */
async function produceOriginal(srcPath, outDir, ext, srcW, srcH) {
  const originalOut = path.join(outDir, `original.${ext}`);
  await copyFile(srcPath, originalOut);
  let { size } = await stat(originalOut);
  let mb = size / 1024 / 1024;

  if (mb <= MAX_FILE_MB) {
    return {
      filename: `original.${ext}`,
      sizeMB: mb,
      reencoded: false,
      quality: null,
      width: srcW,
      height: srcH,
    };
  }

  await unlink(originalOut);

  const webpName = 'original.webp';
  const webpOut = path.join(outDir, webpName);

  for (const q of FALLBACK_QUALITIES) {
    await sharp(srcPath)
      .webp({ quality: q, effort: 6 })
      .toFile(webpOut);

    const s = await stat(webpOut);
    const m = s.size / 1024 / 1024;

    if (m <= MAX_FILE_MB) {
      return {
        filename: webpName,
        sizeMB: m,
        reencoded: true,
        quality: q,
        width: srcW,
        height: srcH,
      };
    }
  }

  await unlink(webpOut);
  return null;
}

// ---------- main ----------
async function build() {
  await mkdir(OUT, { recursive: true });
  await mkdir('data', { recursive: true });

  // Load existing data (merge, don't overwrite)
  const existingIndex = await readJsonSafe(DATA, []);
  const processed = await readJsonSafe(PROCESSED, {});

  // Index by slug for quick lookup
  const indexBySlug = new Map();
  for (const entry of existingIndex) {
    indexBySlug.set(entry.slug, entry);
  }

  const jobs = await collectFiles();

  let added = 0;
  let skipped = 0;

  for (const job of jobs) {
    const { file, srcPath, folder, devices } = job;
    const { category, base } = parseFilename(file);

    // Skip if already processed
    if (processed[base]) {
      console.log(`  ⊘ ${base} — already built, skipped`);
      skipped++;
      continue;
    }

    console.log(`\n▸ [${folder}] ${file}`);

    const outDir = path.join(OUT, base);
    await mkdir(outDir, { recursive: true });

    const meta = await sharp(srcPath).metadata();
    const srcW = meta.width ?? 0;
    const srcH = meta.height ?? 0;
    const orientation = srcW >= srcH ? 'landscape' : 'portrait';

    console.log(`  Source: ${srcW} × ${srcH} (${orientation})`);

    if (folder === 'phone' && orientation === 'landscape') {
      console.log(`  ⚠ Warning: landscape image in the phone folder`);
    }
    if (folder === 'laptop' && orientation === 'portrait') {
      console.log(`  ⚠ Warning: portrait image in the laptop folder`);
    }

    const variants = [];

    // ---- Sized variants ----
    for (const t of TARGETS) {
      if (!devices.includes(t.device)) continue;
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
        `  ✓ ${t.device.padEnd(7)} ${t.label.padEnd(11)} → ${(size / 1024 / 1024).toFixed(2)} MB`
      );
    }

    // ---- Original ----
    const ext = path.extname(file).toLowerCase().slice(1);
    const originalResult = await produceOriginal(srcPath, outDir, ext, srcW, srcH);

    if (originalResult) {
      variants.push({
        device: 'original',
        label: `Original — ${originalResult.width} × ${originalResult.height}`,
        width: originalResult.width,
        height: originalResult.height,
        path: `/wallpapers/${base}/${originalResult.filename}`,
      });

      if (originalResult.reencoded) {
        console.log(
          `  ~ original      → ${originalResult.sizeMB.toFixed(2)} MB  (WebP q${originalResult.quality})`
        );
      } else {
        console.log(
          `  ✓ original      → ${originalResult.sizeMB.toFixed(2)} MB  (${ext.toUpperCase()})`
        );
      }
    } else {
      console.log(`  ✗ original      → skipped (couldn't fit under ${MAX_FILE_MB} MB)`);
    }

    // ---- Record ----
    const entry = {
      slug: base,
      title: titleFromSlug(base),
      category,
      variants,
    };

    indexBySlug.set(base, entry);

    processed[base] = {
      builtAt: new Date().toISOString(),
      variants: variants.map((v) => `${v.device}:${v.width}x${v.height}`),
    };

    added++;
  }

  // Write back merged index (old + new)
  const merged = Array.from(indexBySlug.values());
  await writeFile(DATA, JSON.stringify(merged, null, 2));
  await writeFile(PROCESSED, JSON.stringify(processed, null, 2));

  console.log(`\n─────────────────────────────`);
  console.log(`  New wallpapers processed: ${added}`);
  console.log(`  Already built (skipped):  ${skipped}`);
  console.log(`  Total in index:           ${merged.length}`);
  console.log(`─────────────────────────────\n`);
}

build().catch((e) => {
  console.error(e);
  process.exit(1);
});