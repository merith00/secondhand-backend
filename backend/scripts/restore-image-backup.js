import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { pool } from '../src/config/db.js';
import { localImagePath } from '../src/utils/imageStorage.js';

const directory = process.argv[2];
try {
  if (!directory) throw new Error('Aufruf: node scripts/restore-image-backup.js /pfad/zur/sicherung');
  const records = (await fs.readFile(path.join(directory, 'manifest.jsonl'), 'utf8')).trim().split('\n').filter(Boolean).map(line => JSON.parse(line));
  for (const record of records) {
    const destination = localImagePath(record.oldUrl);
    if (!destination) throw new Error('Ungültiger ursprünglicher Bildpfad.');
    const bytes = await fs.readFile(record.backup);
    if (createHash('sha256').update(bytes).digest('hex') !== record.sha256) throw new Error('Sicherungsdatei ist beschädigt.');
    await fs.writeFile(destination, bytes);
    await pool.query('UPDATE items SET image_url = ? WHERE id = ? AND image_url = ?', [record.oldUrl, record.id, record.newUrl]);
  }
  console.log('Bildsicherung wiederhergestellt. Optimierte Dateien wurden zur Sicherheit behalten.');
} catch (error) { console.error(error.message); process.exitCode = 1; }
finally { await pool.end(); }
