import { pool } from '../config/db.js';

export const findVisibleItems = async (query = {}) => {
  const conditions = [
    "i.status = 'active'",
    'i.is_online_visible = 1',
    'i.is_in_store = 1'
  ];

  const params = [];

  if (query.category) {
    conditions.push('i.category = ?');
    params.push(query.category);
  }

  if (query.size) {
    conditions.push('i.size = ?');
    params.push(query.size);
  }

  if (query.brand) {
    conditions.push('i.brand = ?');
    params.push(query.brand);
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  const [rows] = await pool.query(`
    SELECT
      i.id,
      i.title,
      i.description,
      i.category,
      i.size,
      i.brand,
      i.color,
      i.price,
      i.image_url,
      i.status,
      i.is_in_store,
      i.is_online_visible,
      i.created_at,
      i.updated_at
    FROM items i
    ${whereClause}
    ORDER BY i.created_at DESC
  `, params);

  return rows;
};

export const findVisibleItemById = async (id) => {
  const [rows] = await pool.query(`
    SELECT
      i.id,
      i.title,
      i.description,
      i.category,
      i.size,
      i.brand,
      i.color,
      i.price,
      i.image_url,
      i.status,
      i.is_in_store,
      i.is_online_visible,
      i.created_at,
      i.updated_at
    FROM items i
    WHERE i.id = ?
      AND i.status = 'active'
      AND i.is_online_visible = 1
      AND i.is_in_store = 1
  `, [id]);

  return rows[0] || null;
};