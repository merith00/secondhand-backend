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
    data.customer_number || '',
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


export const getCreditsOverview = async () => {
  const [rows] = await pool.query(`
SELECT
    c.id,
    c.customer_number,
    c.first_name,
    c.last_name,

    COALESCE(owner_stats.sold_items_count, 0) AS sold_items_count,
    COALESCE(owner_stats.total_credit_earned, 0) AS total_credit_earned,

    COALESCE(buyer_stats.bought_items_count, 0) AS bought_items_count,
    COALESCE(buyer_stats.total_credit_spent, 0) AS total_credit_spent,

    COALESCE(item_stats.available_items_count, 0) AS available_items_count,
    COALESCE(total_item_stats.total_items_count, 0) AS total_items_count,

    COALESCE(owner_stats.total_credit_earned, 0)
      - COALESCE(buyer_stats.total_credit_spent, 0) AS credit_balance

FROM customers c

LEFT JOIN (
    SELECT
        owner_customer_id,
        COUNT(*) AS sold_items_count,
        SUM(owner_amount) AS total_credit_earned
    FROM sales
    GROUP BY owner_customer_id
) owner_stats
    ON owner_stats.owner_customer_id = c.id

LEFT JOIN (
    SELECT
        buyer_customer_id,
        COUNT(*) AS bought_items_count,
        SUM(sale_price) AS total_credit_spent
    FROM sales
    GROUP BY buyer_customer_id
) buyer_stats
    ON buyer_stats.buyer_customer_id = c.id

LEFT JOIN (
    SELECT
        i.owner_customer_id,
        COUNT(*) AS available_items_count
    FROM items i
    WHERE NOT EXISTS (
        SELECT 1
        FROM sales s
        WHERE s.item_id = i.id
    )
    GROUP BY i.owner_customer_id
) item_stats
    ON item_stats.owner_customer_id = c.id

LEFT JOIN (
    SELECT
        owner_customer_id,
        COUNT(*) AS total_items_count
    FROM items
    GROUP BY owner_customer_id
) total_item_stats
    ON total_item_stats.owner_customer_id = c.id

ORDER BY c.last_name ASC, c.first_name ASC;
  `);

  return rows;
};