import { pool } from '../config/db.js';

export const findAll = async (type = null) => {
  let sql = `
    SELECT
      id,
      type,
      value,
      sort_order,
      is_active,
      created_at
    FROM item_options
  `;

  const params = [];

  if (type) {
    sql += ` WHERE type = ?`;
    params.push(type);
  }

  sql += ` ORDER BY type, sort_order, value`;

  const [rows] = await pool.query(sql, params);

  return rows;
};

export const findById = async (id) => {
  const [rows] = await pool.query(
    `
      SELECT
        id,
        type,
        value,
        sort_order,
        is_active,
        created_at
      FROM item_options
      WHERE id = ?
    `,
    [id]
  );

  return rows[0] || null;
};

export const insert = async (data) => {
  const [result] = await pool.query(
    `
      INSERT INTO item_options (
        type,
        value,
        sort_order,
        is_active
      )
      VALUES (?, ?, ?, ?)
    `,
    [
      data.type,
      data.value,
      Number(data.sort_order ?? 0),
      Number(data.is_active ?? 1),
    ]
  );

  return result.insertId;
};

export const remove = async (id) => {
  const [result] = await pool.query(
    `DELETE FROM item_options WHERE id = ?`,
    [id]
  );

  return result.affectedRows;
};