import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash, randomUUID } from 'node:crypto';

// Do not retain open source files; uploads must be removable on Windows too.
sharp.cache({ files: 0, memory: 32 });

export const uploadDirectory = process.env.IMAGE_UPLOAD_DIR
  ? path.resolve(process.env.IMAGE_UPLOAD_DIR)
  : fileURLToPath(new URL('../../uploads/items/', import.meta.url));
const cacheDirectory = path.join(uploadDirectory, '.image-cache');
const pending = new Map();
let running = 0;
const waiting = [];

export function localImagePath(url) {
  if (typeof url !== 'string' || !url.startsWith('/uploads/items/')) return null;
  const filename = url.slice('/uploads/items/'.length);
  if (!filename || path.basename(filename) !== filename || /[\\/\0]/.test(filename)) return null;
  return path.join(uploadDirectory, filename);
}

export async function encodeImage(source, destination, thumbnail = false) {
  if (running >= 2) await new Promise(resolve => waiting.push(resolve));
  else running++;
  try {
    await sharp(source, { limitInputPixels: 80_000_000, failOn: 'error' })
    .rotate()
    .resize({ width: thumbnail ? 240 : 1600, height: thumbnail ? 240 : 1600,
      fit: 'inside', withoutEnlargement: true })
    .webp({ quality: thumbnail ? 75 : 82, effort: 4 })
      .toFile(destination);
  } finally {
    const next = waiting.shift();
    if (next) next(); else running--;
  }
}

export async function prepareUpload(source) {
  const filename = `optimized-${randomUUID()}.webp`;
  const destination = path.join(uploadDirectory, filename);
  try {
    await encodeImage(source, destination);
    await getImageVariant(destination, true);
    return { path: destination, url: `/uploads/items/${filename}` };
  } catch (error) {
    await removeImage(`/uploads/items/${filename}`).catch(() => {});
    throw error;
  }
}

export async function getImageVariant(source, thumbnail = false) {
  const stat = await fs.stat(source);
  // Already optimized originals need no second lossy conversion.
  if (!thumbnail && /^optimized-[a-f0-9-]+\.webp$/.test(path.basename(source))) return source;
  const key = createHash('sha256').update(`${path.basename(source)}:${stat.size}:${stat.mtimeMs}`).digest('hex');
  const destination = path.join(cacheDirectory, `${key}-${thumbnail ? 'thumb' : 'full'}.webp`);
  try { await fs.access(destination); return destination; } catch {}
  if (!pending.has(destination)) {
    const task = (async () => {
      await fs.mkdir(cacheDirectory, { recursive: true });
      const temporary = `${destination}.${randomUUID()}.tmp`;
      try {
        await encodeImage(source, temporary, thumbnail);
        await fs.rename(temporary, destination);
      } finally { await fs.rm(temporary, { force: true }).catch(() => {}); }
    })();
    pending.set(destination, task);
    task.finally(() => pending.delete(destination)).catch(() => {});
  }
  await pending.get(destination);
  return destination;
}

export async function removeImage(url) {
  const source = localImagePath(url);
  if (!source) return;
  try {
    const stat = await fs.stat(source);
    const key = createHash('sha256').update(`${path.basename(source)}:${stat.size}:${stat.mtimeMs}`).digest('hex');
    await Promise.all(['thumb', 'full'].map(variant => fs.rm(path.join(cacheDirectory, `${key}-${variant}.webp`), { force: true })));
    await fs.rm(source, { force: true });
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
}
