import { asyncHandler } from '../utils/asyncHandler.js';
import * as shopOrderService from '../services/shopOrder.service.js';

export const getShopOrders = asyncHandler(async (req, res) => {
  const orders = await shopOrderService.getAllShopOrders();
  res.json(orders);
});

export const createShopOrder = asyncHandler(async (req, res) => {
  const order = await shopOrderService.createShopOrder(req.body);
  res.status(201).json(order);
});