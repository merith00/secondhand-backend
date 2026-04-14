import { asyncHandler } from '../utils/asyncHandler.js';
import * as itemService from '../services/item.service.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
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


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function uploadItemImage(req, res, next) {
  try {
    const itemId = req.params.id;

    if (!req.file) {
      return res.status(400).json({ message: 'Kein Bild hochgeladen' });
    }

    const [rows] = await pool.query('SELECT image_url FROM items WHERE id = ?', [itemId]);

    if (!rows.length) {
      return res.status(404).json({ message: 'Artikel nicht gefunden' });
    }

    const oldImageUrl = rows[0].image_url;
    const imageUrl = `/uploads/items/${req.file.filename}`;

    await pool.query('UPDATE items SET image_url = ? WHERE id = ?', [imageUrl, itemId]);

    if (oldImageUrl) {
      const oldFilePath = path.join(__dirname, '../../', oldImageUrl);
      fs.unlink(oldFilePath, () => {});
    }

    return res.json({
      message: 'Bild erfolgreich hochgeladen',
      image_url: imageUrl,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteItemImage(req, res, next) {
  try {
    const itemId = req.params.id;

    const [rows] = await pool.query('SELECT image_url FROM items WHERE id = ?', [itemId]);

    if (!rows.length) {
      return res.status(404).json({ message: 'Artikel nicht gefunden' });
    }

    const imageUrl = rows[0].image_url;

    await pool.query('UPDATE items SET image_url = NULL WHERE id = ?', [itemId]);

    if (imageUrl) {
      const filePath = path.join(__dirname, '../../', imageUrl);
      fs.unlink(filePath, () => {});
    }

    return res.json({ message: 'Bild gelöscht' });
  } catch (err) {
    next(err);
  }
}