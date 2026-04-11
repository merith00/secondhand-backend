import { asyncHandler } from '../utils/asyncHandler.js';
import * as saleService from '../services/sale.service.js';

export const getSales = asyncHandler(async (req, res) => {
  const sales = await saleService.getAllSales();
  res.json(sales);
});

export const createSale = asyncHandler(async (req, res) => {
  const newSale = await saleService.createSale(req.body);
  res.status(201).json(newSale);
});