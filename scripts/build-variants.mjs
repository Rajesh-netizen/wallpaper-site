import sharp from 'sharp';
import { readdir, mkdir, writeFile, copyFile, stat, unlink } from 'fs/promises';
import path from 'path';

const SRC = 'sources';
const OUT = 'public/wallpapers';
const DATA = 'data/wallpapers.json';

// Cloudflare Pages hard limit is 25 MiB. Use 24 MiB to leave headroom.
const MAX_FILE_MB = 24;

// If an original is over the limit, try these WebP quality levels in order,
// stopping at the first that brings the file under MAX_FILE_MB.
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
 * Produce an "original" variant under MAX_FILE_MB.
 * If the source is already small enough, copy it byte-for-byte.
 * If it's too large, re-encode as WebP — trying decreasing quality
 * levels until it lands under the limit.
 */
async function produceOriginal(srcPath, outDir, ext, srcW, srcH) {
  const originalOut = path.join(outDir, `original.${ext}`);
  await copyFile(srcPath, originalOut);
  let { size } = await stat(originalOut);
  let mb = size / 1024 / 1024;

  // Fast path — already under the limit, keep the exact source bytes
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

  // Too large — re-encode as WebP
  // Remove the copied original, we'll write a .webp instead
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

  // If even quality 75 is too big, drop the original entirely
  await unlink(webpOut);
  return null;
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

    // ---- Original — copy, or re-encode if too large ----
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
          `  ~ original      → ${originalResult.sizeMB.toFixed(2)} MB  (WebP q${originalResult.quality}, re-encoded from ${ext.toUpperCase()})`
        );
      } else {
        console.log(
          `  ✓ original      → ${originalResult.sizeMB.toFixed(2)} MB  (${ext.toUpperCase()})`
        );
      }
    } else {
      console.log(`  ✗ original      → skipped (could not compress under ${MAX_FILE_MB} MB)`);
    }

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
