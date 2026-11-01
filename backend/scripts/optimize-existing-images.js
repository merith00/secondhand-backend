import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { pool } from '../src/config/db.js';
import { uploadDirectory, localImagePath, prepareUpload, removeImage } from '../src/utils/imageStorage.js';

const args = process.argv.slice(2);
const apply = args.includes('--apply');
const backupIndex = args.indexOf('--backup-dir');
const backupDirectory = backupIndex >= 0 && args[backupIndex + 1] ? path.resolve(args[backupIndex + 1]) : null;
const manifest = backupDirectory && path.join(backupDirectory, 'manifest.jsonl');
const digest = bytes => createHash('sha256').update(bytes).digest('hex');

async function main() {
  console.log(`Datenbank: ${process.env.DB_HOST}:${process.env.DB_PORT || 3306}/${process.env.DB_NAME}`);
  if (apply) {
    if (!backupDirectory) throw new Error('--apply benötigt --backup-dir mit einem neuen, leeren Sicherungsordner.');
    const uploadsRoot = path.dirname(uploadDirectory);
    const relative = path.relative(uploadsRoot, backupDirectory);
    if (!relative || (!relative.startsWith('..' + path.sep) && relative !== '..' && !path.isAbsolute(relative))) {
      throw new Error('Die Sicherung muss außerhalb des öffentlich erreichbaren uploads-Ordners liegen.');
    }
    // Never overwrite a previous run's rollback data.
    await fs.mkdir(backupDirectory, { recursive: false });
    await fs.writeFile(manifest, '', { flag: 'wx' });
  }
  const [rows] = await pool.query('SELECT id, image_url FROM items WHERE image_url IS NOT NULL');
  const capacity = await fs.statfs(uploadDirectory);
  console.log(`Freier Upload-Speicher: ${Math.floor(Number(capacity.bavail) * Number(capacity.bsize) / 1024 / 1024)} MiB`);
  let total = 0, optimizedBytes = 0, converted = 0, missing = 0;
  for (const row of rows) {
    const source = localImagePath(row.image_url);
    if (!source || /^optimized-[a-f0-9-]+\.webp$/.test(path.basename(source))) continue;
    let original;
    try { original = await fs.readFile(source); }
    catch (error) { if (error.code === 'ENOENT') { missing++; console.warn(`Artikel ${row.id}: Quelldatei fehlt.`); continue; } throw error; }
    total += original.length;
    if (!apply) { converted++; continue; }
    const free = await fs.statfs(uploadDirectory);
    const backupFree = await fs.statfs(backupDirectory);
    if (Number(free.bavail) * Number(free.bsize) < original.length * 3 + 16 * 1024 * 1024
      || Number(backupFree.bavail) * Number(backupFree.bsize) < original.length + 16 * 1024 * 1024) {
      throw new Error('Zu wenig freier Speicher für eine sichere Bildumwandlung samt Sicherung.');
    }
    const backup = path.join(backupDirectory, `${row.id}-${path.basename(source)}`);
    await fs.writeFile(backup, original, { flag: 'wx' });
    if (digest(await fs.readFile(backup)) !== digest(original)) throw new Error('Sicherungsprüfung fehlgeschlagen.');
    const optimized = await prepareUpload(source);
    const record = { id: row.id, oldUrl: row.image_url, newUrl: optimized.url, backup, sha256: digest(original) };
    // Persist rollback details before updating any database reference.
    await fs.appendFile(manifest, JSON.stringify(record) + '\n');
    const connection = await pool.getConnection();
    let committed = false;
    try {
      await connection.beginTransaction();
      const [result] = await connection.query('UPDATE items SET image_url = ? WHERE id = ? AND image_url = ?', [optimized.url, row.id, row.image_url]);
      if (!result.affectedRows) {
        await connection.rollback(); await removeImage(optimized.url); continue;
      }
      await connection.commit(); committed = true;
      optimizedBytes += (await fs.stat(optimized.path)).size;
      converted++;
      const [references] = await connection.query('SELECT id FROM items WHERE image_url = ? LIMIT 1', [row.image_url]);
      if (!references.length) await removeImage(row.image_url);
    } catch (error) {
      if (!committed) { await connection.rollback(); await removeImage(optimized.url).catch(() => {}); }
      throw error;
    } finally { connection.release(); }
  }
  console.log(JSON.stringify({ mode: apply ? 'umgewandelt' : 'Vorschau, keine Änderungen', images: converted, missing, sourceBytes: total, optimizedBytes: apply ? optimizedBytes : null }));
  if (apply) console.log('Originale und Rücksetzprotokoll liegen im Sicherungsordner. Die Sicherung belegt weiterhin Platz und sollte anschließend extern gesichert werden.');
}

try { await main(); }
catch (error) { console.error(error.message); process.exitCode = 1; }
finally { await pool.end(); }
