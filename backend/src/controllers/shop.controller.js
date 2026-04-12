import { asyncHandler } from '../utils/asyncHandler.js';
import * as shopService from '../services/shop.service.js';

export const getShopItems = asyncHandler(async (req, res) => {
  const items = await shopService.getVisibleShopItems(req.query);
  res.json(items);
});

export const getShopItemById = asyncHandler(async (req, res) => {
  const item = await shopService.getVisibleShopItemById(Number(req.params.id));
  res.json(item);
});