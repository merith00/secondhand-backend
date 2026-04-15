import { pool } from '../config/db.js';

export const findAll = async () => {
  const [rows] = await pool.query(`
    SELECT
      s.id,
      s.item_id,
      s.owner_customer_id,
      s.sale_date,
      s.sale_price,
      s.owner_amount,
      s.shop_amount,
      s.sale_type,
      s.payment_method,
      s.notes,
      s.created_at,
      s.updated_at,
      s.buyer_customer_id,
      i.title,
      i.brand,
      i.category,
      c.customer_number,
      c.first_name,
      c.last_name
    FROM sales s
    INNER JOIN items i ON i.id = s.item_id
    INNER JOIN customers c ON c.id = s.owner_customer_id
    ORDER BY s.sale_date DESC, s.id DESC
  `);

  return rows;
};

export const findById = async (id) => {
  const [rows] = await pool.query(`
    SELECT
      s.id,
      s.item_id,
      s.owner_customer_id,
      s.sale_date,
      s.sale_price,
      s.owner_amount,
      s.shop_amount,
      s.sale_type,
      s.payment_method,
      s.notes,
      s.created_at,
      s.updated_at,
      s.buyer_customer_id,
      i.title,
      i.brand,
      i.category,
      c.customer_number,
      c.first_name,
      c.last_name
    FROM sales s
    INNER JOIN items i ON i.id = s.item_id
    INNER JOIN customers c ON c.id = s.owner_customer_id
    WHERE s.id = ?
  `, [id]);

  return rows[0] || null;
};

export const findByItemId = async (itemId) => {
  const [rows] = await pool.query(`
    SELECT id, item_id
    FROM sales
    WHERE item_id = ?
  `, [itemId]);

  return rows[0] || null;
};

export const insert = async (data) => {
  const [result] = await pool.query(`
    INSERT INTO sales (
      item_id,
      owner_customer_id,
      sale_price,
      owner_amount,
      shop_amount,
      sale_type,
      payment_method,
      notes,
      buyer_customer_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    data.item_id,
    data.owner_customer_id,
    data.sale_price,
    data.owner_amount,
    data.shop_amount,
    data.sale_type,
    data.payment_method,
    data.notes || null,
    data.buyer_customer_id,
  ]);

  return result.insertId;
};