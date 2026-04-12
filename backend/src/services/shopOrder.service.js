import { pool } from '../config/db.js';
import * as shopOrderRepository from '../repositories/shopOrder.repository.js';
import * as itemRepository from '../repositories/item.repository.js';
import { createOrderNumber } from '../utils/orderNumber.js';

export const getAllShopOrders = async () => {
  const orders = await shopOrderRepository.findAll();

  const ordersWithItems = await Promise.all(
    orders.map(async (order) => {
      const items = await shopOrderRepository.findOrderItemsByOrderId(order.id);
      return {
        ...order,
        items,
      };
    })
  );

  return ordersWithItems;
};

export const createShopOrder = async (data) => {
  validateOrderInput(data);

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const items = [];

    for (const rawItemId of data.items) {
      const itemId = Number(rawItemId);
      const item = await itemRepository.findById(itemId);

      if (!item) {
        const error = new Error(`Kleidungsstück mit ID ${itemId} nicht gefunden`);
        error.statusCode = 404;
        throw error;
      }

      if (item.status !== 'active' || Number(item.is_online_visible) !== 1 || Number(item.is_in_store) !== 1) {
        const error = new Error(`Kleidungsstück "${item.title}" ist nicht mehr verfügbar`);
        error.statusCode = 400;
        throw error;
      }

      items.push(item);
    }

    const totalAmount = items.reduce((sum, item) => sum + Number(item.price), 0);

    const orderId = await shopOrderRepository.insertOrder({
      ...data,
      total_amount: Number(totalAmount.toFixed(2)),
    });

    const orderNumber = createOrderNumber(orderId);
    await shopOrderRepository.updateOrderNumber(orderId, orderNumber);

    for (const item of items) {
      await shopOrderRepository.insertOrderItem({
        order_id: orderId,
        item_id: item.id,
        item_title: item.title,
        item_price: item.price,
      });

      await itemRepository.update(item.id, {
        status: 'reserved',
        is_online_visible: 0,
      });
    }

    await connection.commit();

    const savedOrder = await shopOrderRepository.findById(orderId);
    const savedItems = await shopOrderRepository.findOrderItemsByOrderId(orderId);

    return {
      ...savedOrder,
      items: savedItems,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const validateOrderInput = (data) => {
  if (!data.first_name || !data.last_name || !data.email || !data.street || !data.postal_code || !data.city) {
    const error = new Error('Bitte alle Pflichtfelder für die Bestellung ausfüllen');
    error.statusCode = 400;
    throw error;
  }

  if (!Array.isArray(data.items) || data.items.length === 0) {
    const error = new Error('Der Warenkorb ist leer');
    error.statusCode = 400;
    throw error;
  }
};