import { pool } from '../config/db.js';

export const findAll = async () => {
  const [rows] = await pool.query(`
    SELECT
      id,
      order_number,
      first_name,
      last_name,
      email,
      phone,
      street,
      house_number,
      postal_code,
      city,
      payment_method,
      order_status,
      total_amount,
      notes,
      created_at,
      updated_at
    FROM shop_orders
    ORDER BY created_at DESC, id DESC
  `);

  return rows;
};

export const findById = async (id) => {
  const [rows] = await pool.query(`
    SELECT
      id,
      order_number,
      first_name,
      last_name,
      email,
      phone,
      street,
      house_number,
      postal_code,
      city,
      payment_method,
      order_status,
      total_amount,
      notes,
      created_at,
      updated_at
    FROM shop_orders
    WHERE id = ?
  `, [id]);

  return rows[0] || null;
};

export const insertOrder = async (data) => {
  const [result] = await pool.query(`
    INSERT INTO shop_orders (
      order_number,
      first_name,
      last_name,
      email,
      phone,
      street,
      house_number,
      postal_code,
      city,
      payment_method,
      order_status,
      total_amount,
      notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    '',
    data.first_name,
    data.last_name,
    data.email,
    data.phone || null,
    data.street,
    data.house_number || null,
    data.postal_code,
    data.city,
    'bank_transfer',
    'reserved',
    data.total_amount,
    data.notes || null,
  ]);

  return result.insertId;
};

export const updateOrderNumber = async (id, orderNumber) => {
  await pool.query(`
    UPDATE shop_orders
    SET order_number = ?
    WHERE id = ?
  `, [orderNumber, id]);
};

export const insertOrderItem = async (data) => {
  await pool.query(`
    INSERT INTO shop_order_items (
      order_id,
      item_id,
      item_title,
      item_price
    ) VALUES (?, ?, ?, ?)
  `, [
    data.order_id,
    data.item_id,
    data.item_title,
    data.item_price,
  ]);
};

export const findOrderItemsByOrderId = async (orderId) => {
  const [rows] = await pool.query(`
    SELECT
      id,
      order_id,
      item_id,
      item_title,
      item_price,
      created_at
    FROM shop_order_items
    WHERE order_id = ?
    ORDER BY id ASC
  `, [orderId]);

  return rows;
};