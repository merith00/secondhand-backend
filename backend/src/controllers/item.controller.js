import { asyncHandler } from '../utils/asyncHandler.js';
import * as itemService from '../services/item.service.js';
import fs from 'node:fs/promises';
import { prepareUpload, removeImage } from '../utils/imageStorage.js';


import { pool } from '../config/db.js';

export const getItems = asyncHandler(async (req, res) => {
    const items = await itemService.getAllItems(req.query);
    res.json(items);
});
export const getItemById = asyncHandler(async (req, res) => {
    const item = await itemService.getItemById(Number(req.params.id));
    res.json(item);
});
export const createItem = asyncHandler(async (req, res) => {
    const newItem = await itemService.createItem(req.body);
    res.status(201).json(newItem);
});
export const updateItem = asyncHandler(async (req, res) => {
    const updatedItem = await itemService.updateItem(Number(req.params.id),
        req.body);
    res.json(updatedItem);
});
export const updateItemStatus = asyncHandler(async (req, res) => {
    const updatedItem = await
        itemService.updateItemStatus(Number(req.params.id), req.body.status);
    res.json(updatedItem);
});



export async function uploadItemImage(req, res, next) {
  let optimized;
  let committed = false;
  try {
    const itemId = req.params.id;
    if (!req.file) return res.status(400).json({ message: 'Kein Bild hochgeladen' });
    const [rows] = await pool.query('SELECT image_url FROM items WHERE id = ?', [itemId]);
    if (!rows.length) return res.status(404).json({ message: 'Artikel nicht gefunden' });
    try {
      optimized = await prepareUpload(req.file.path);
    } catch (cause) {
      if (cause.code) throw cause;
      return res.status(400).json({ message: 'Bild konnte nicht verarbeitet werden. Bitte eine gültige JPG-, PNG- oder WebP-Datei verwenden.' });
    }
    const [result] = await pool.query('UPDATE items SET image_url = ? WHERE id = ?', [optimized.url, itemId]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Artikel nicht gefunden' });
    committed = true;
    if (rows[0].image_url) {
      try {
        const [references] = await pool.query('SELECT id FROM items WHERE image_url = ? LIMIT 1', [rows[0].image_url]);
        if (!references.length) await removeImage(rows[0].image_url);
      } catch (error) { console.error('Altes Artikelbild konnte nicht entfernt werden:', error); }
    }
    return res.json({ message: 'Bild erfolgreich hochgeladen', image_url: optimized.url });
  } catch (error) {
    next(error);
  } finally {
    if (req.file) await fs.rm(req.file.path, { force: true }).catch(() => {});
    if (optimized && !committed) await removeImage(optimized.url).catch(() => {});
  }
}

export async function deleteItemImage(req, res, next) {
  try {
    const itemId = req.params.id;
    const [rows] = await pool.query('SELECT image_url FROM items WHERE id = ?', [itemId]);
    if (!rows.length) return res.status(404).json({ message: 'Artikel nicht gefunden' });
    await pool.query('UPDATE items SET image_url = NULL WHERE id = ?', [itemId]);
    if (rows[0].image_url) {
      try {
        const [references] = await pool.query('SELECT id FROM items WHERE image_url = ? LIMIT 1', [rows[0].image_url]);
        if (!references.length) await removeImage(rows[0].image_url);
      } catch (error) { console.error('Artikelbild konnte nicht entfernt werden:', error); }
    }
    return res.json({ message: 'Bild gelöscht' });
  } catch (error) { next(error); }
}
