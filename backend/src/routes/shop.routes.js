import { Router } from 'express';
import {
  getShopItems,
  getShopItemById
} from '../controllers/shop.controller.js';

const router = Router();

router.get('/items', getShopItems);
router.get('/items/:id', getShopItemById);

export default router;