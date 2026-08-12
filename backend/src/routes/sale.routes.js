import { Router } from 'express';

import {
  getSales,
  createSale,
  createBatchSale,
} from '../controllers/sale.controller.js';

const router = Router();

router.get('/', getSales);
router.post('/', createSale);
router.post('/batch', createBatchSale);

export default router;