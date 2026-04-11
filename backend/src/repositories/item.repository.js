import { pool } from '../config/db.js';
export const findAll = async (query = {}) => {
const conditions = [];
const params = [];
if (query.status) {
conditions.push('i.status = ?');
params.push(query.status);
}
if (query.owner_customer_id) {
conditions.push('i.owner_customer_id = ?');
params.push(Number(query.owner_customer_id));
}
if (query.is_online_visible != null) {
conditions.push('i.is_online_visible = ?');
params.push(Number(query.is_online_visible));
}
const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}
` : '';
const [rows] = await pool.query(`
 SELECT
 i.id,
 i.owner_customer_id,
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
 i.sold_at,
 i.created_at,
 i.updated_at,
 c.customer_number,
 c.first_name,
 c.last_name
 FROM items i
 INNER JOIN customers c ON c.id = i.owner_customer_id
${whereClause}
 ORDER BY i.created_at DESC
 `, params);
return rows;
};
export const findById = async (id) => {
const [rows] = await pool.query(`
 SELECT
 i.id,
 i.owner_customer_id,
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
 i.sold_at,
 i.created_at,
 i.updated_at,
 c.customer_number,
 c.first_name,
 c.last_name
 FROM items i
 INNER JOIN customers c ON c.id = i.owner_customer_id
 WHERE i.id = ?
 `, [id]);
return rows[0] || null;
};


export const insert = async (data) => {
const [result] = await pool.query(`
 INSERT INTO items (
 owner_customer_id,
 title,
 description,
 category,
 size,
 brand,
 color,
 price,
 image_url,
 status,
 is_in_store,
 is_online_visible,
 sold_at
 ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
 `, [
Number(data.owner_customer_id),
data.title,
data.description || null,
data.category || null,
data.size || null,
data.brand || null,
data.color || null,
Number(data.price),
data.image_url || null,
data.status || 'active',
Number(data.is_in_store ?? 1),
Number(data.is_online_visible ?? 0),
data.sold_at || null
]);
return result.insertId;
};

export const update = async (id, data) => {
await pool.query(`
 UPDATE items
 SET
 owner_customer_id = COALESCE(?, owner_customer_id),
 title = COALESCE(?, title),
 description = COALESCE(?, description),
 category = COALESCE(?, category),
 size = COALESCE(?, size),
 brand = COALESCE(?, brand),
 color = COALESCE(?, color),
 price = COALESCE(?, price),
 image_url = COALESCE(?, image_url),
 status = COALESCE(?, status),
 is_in_store = COALESCE(?, is_in_store),
 is_online_visible = COALESCE(?, is_online_visible),
 sold_at = COALESCE(?, sold_at)
 WHERE id = ?
 `, [
data.owner_customer_id ?? null,
data.title ?? null,
data.description ?? null,
data.category ?? null,
data.size ?? null,
data.brand ?? null,
data.color ?? null,
data.price ?? null,
data.image_url ?? null,
data.status ?? null,
data.is_in_store ?? null,
data.is_online_visible ?? null,
data.sold_at ?? null,
id
]);
};