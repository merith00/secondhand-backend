import { Router } from 'express';
import customerRoutes from './customer.routes.js';
import itemRoutes from './item.routes.js';
import saleRoutes from './sale.routes.js';

const router = Router();

router.use('/customers', customerRoutes);
router.use('/items', itemRoutes);
router.use('/sales', saleRoutes);

export default router;