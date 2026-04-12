import { Router } from 'express';
import {
  createShopOrder,
  getShopOrders
} from '../controllers/shopOrder.controller.js';

const router = Router();

router.get('/', getShopOrders);
router.post('/', createShopOrder);

export default router;