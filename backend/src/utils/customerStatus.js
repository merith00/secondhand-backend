import { pool } from '../config/db.js';

export async function updateCustomerStatus(customerId) {
  console.log(`Updating status for customer ID: ${customerId}`);

  const [[{ availableItemsCount }]] = await pool.query(
    `
    SELECT COUNT(*) AS availableItemsCount
    FROM items
    WHERE owner_customer_id = ?
      AND status = 'active'
    `,
    [customerId]
  );

  const [[{ betragEingenommen }]] = await pool.query(
    `
    SELECT COALESCE(SUM(owner_amount), 0) AS betragEingenommen
    FROM sales
    WHERE owner_customer_id = ?
    `,
    [customerId]
  );

  const [[{ betragAusgegeben }]] = await pool.query(
    `
    SELECT COALESCE(SUM(sale_price), 0) AS betragAusgegeben
    FROM sales
    WHERE buyer_customer_id = ?
    `,
    [customerId]
  );

  const creditBalance =
    Number(betragEingenommen) - Number(betragAusgegeben);

  const isActive =
    Number(availableItemsCount) > 0 || creditBalance !== 0;

  console.log(
    `Customer ${customerId}: ` +
      `availableItems=${availableItemsCount}, ` +
      `eingenommen=${betragEingenommen}, ` +
      `ausgegeben=${betragAusgegeben}, ` +
      `credit=${creditBalance}, ` +
      `active=${isActive}`
  );

  await pool.query(
    `
    UPDATE customers
    SET is_active = ?
    WHERE id = ?
    `,
    [isActive ? 1 : 0, customerId]
  );
}