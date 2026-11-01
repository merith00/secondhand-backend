import os from 'node:os';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
const backend = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(path.join(backend, 'package.json'));
const sharp = require('sharp');
const root = await fs.mkdtemp(path.join(os.tmpdir(), 'secondhand-migration-'));
const uploadDirectory = path.join(root, 'uploads', 'items');
await fs.mkdir(uploadDirectory, { recursive: true });
process.env.IMAGE_UPLOAD_DIR = uploadDirectory;
const storage = await import(pathToFileURL(path.join(backend, 'src/utils/imageStorage.js')));
const source = path.join(uploadDirectory, 'old.png');
await sharp({ create: { width: 2100, height: 1500, channels: 3, background: 'blue' } }).png().toFile(source);
const bytes = await fs.readFile(source);
let url = '/uploads/items/old.png';
const pool = {
  query: async () => [[{ id: 1, image_url: url }]], end: async () => {},
  getConnection: async () => ({
    beginTransaction: async () => {}, commit: async () => {}, rollback: async () => {}, release: () => {},
    query: async (sql, params) => {
      if (sql.startsWith('UPDATE')) { if (params[2] !== url) return [{ affectedRows: 0 }]; url = params[0]; return [{ affectedRows: 1 }]; }
      return [[]];
    },
  }),
};
const code = (await fs.readFile(path.join(backend, 'scripts/optimize-existing-images.js'), 'utf8'))
  .replace(/^import .*;\r?\n/gm, '');
const AsyncFunction = Object.getPrototypeOf(async function() {}).constructor;
async function run(args) {
  const mockProcess = { argv: ['node', 'script', ...args], env: { DB_HOST: 'test', DB_NAME: 'test' }, exitCode: 0 };
  await new AsyncFunction('fs', 'path', 'createHash', 'pool', 'uploadDirectory', 'localImagePath', 'prepareUpload', 'removeImage', 'process', code)(
    fs, path, createHash, pool, uploadDirectory, storage.localImagePath, storage.prepareUpload, storage.removeImage, mockProcess);
  return mockProcess.exitCode;
}
assert.equal(await run([]), 0);
assert.equal(url, '/uploads/items/old.png');
assert.deepEqual(await fs.readFile(source), bytes);
const backup = path.join(root, 'backup');
assert.equal(await run(['--apply', '--backup-dir', backup]), 0);
assert.match(url, /optimized-.*\.webp$/);
await assert.rejects(fs.access(source));
const record = JSON.parse((await fs.readFile(path.join(backup, 'manifest.jsonl'), 'utf8')).trim());
assert.deepEqual(await fs.readFile(record.backup), bytes);
assert.equal(record.newUrl, url);
assert.equal(await run(['--apply', '--backup-dir', backup]), 1);
const restore = (await fs.readFile(path.join(backend, 'scripts/restore-image-backup.js'), 'utf8')).replace(/^import .*;\r?\n/gm, '');
pool.query = async (sql, params) => { assert.equal(params[2], url); url = params[0]; return [{ affectedRows: 1 }]; };
await new AsyncFunction('fs', 'path', 'createHash', 'pool', 'localImagePath', 'process', restore)(
  fs, path, createHash, pool, storage.localImagePath, { argv: ['node', 'restore', backup], exitCode: 0 });
assert.equal(url, '/uploads/items/old.png');
assert.deepEqual(await fs.readFile(source), bytes);
console.log('Migration geprüft: Vorschau ohne Änderungen, Sicherung, Umwandlung, bestehende Sicherung geschützt und Wiederherstellung.');

assert.equal(path.dirname(root), path.resolve(os.tmpdir()));
assert.ok(path.basename(root).startsWith('secondhand-migration-'));
await fs.rm(root, { recursive: true, force: true });
