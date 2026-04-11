import { pool } from '../config/db.js';
export const findAll = async () => {
    const [rows] = await pool.query(`
 SELECT
 id,
 customer_number,
 first_name,
 last_name,
 street,
 house_number,
 postal_code,
 city,
 phone,
 email,
 notes,
 is_active,
 created_at,
 updated_at
 FROM customers
 ORDER BY last_name ASC, first_name ASC
 `);
    return rows;
};
export const findById = async (id) => {
    const [rows] = await pool.query(`
 SELECT
 id,
 customer_number,
 first_name,
 last_name,
 street,
 house_number,
 postal_code,
 city,
 phone,
 email,
 notes,
 is_active,
 created_at,
 updated_at
 FROM customers
 WHERE id = ?
 `, [id]);
    return rows[0] || null;
};
export const insert = async (data) => {
    const [result] = await pool.query(`
 INSERT INTO customers (
 customer_number,
 first_name,
 last_name,
 street,
 house_number,
 postal_code,
 city,
 phone,
 email,
 notes,
 is_active
 ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
 `, [
        '',
        data.first_name,
        data.last_name,
        data.street || null,
        data.house_number || null,
        data.postal_code || null,
        data.city || null,
        data.phone || null,
        data.email || null,
        data.notes || null,
        data.is_active ?? 1
    ]);
    return result.insertId;
};
export const updateCustomerNumber = async (id, customerNumber) => {
    await pool.query(`
 UPDATE customers
 SET customer_number = ?
 WHERE id = ?
 `, [customerNumber, id]);
};
export const update = async (id, data) => {
    await pool.query(`
UPDATE customers
 SET
 first_name = COALESCE(?, first_name),
 last_name = COALESCE(?, last_name),
 street = COALESCE(?, street),
 house_number = COALESCE(?, house_number),
 postal_code = COALESCE(?, postal_code),
 city = COALESCE(?, city),
 phone = COALESCE(?, phone),
 email = COALESCE(?, email),
 notes = COALESCE(?, notes),
 is_active = COALESCE(?, is_active)
 WHERE id = ?
 `, [
        data.first_name ?? null,
        data.last_name ?? null,
        data.street ?? null,
        data.house_number ?? null,
        data.postal_code ?? null,
        data.city ?? null,
        data.phone ?? null,
        data.email ?? null,
        data.notes ?? null,
        data.is_active ?? null,
        id
    ]);
};
