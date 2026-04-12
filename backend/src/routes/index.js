import { Router } from 'express';
import customerRoutes from './customer.routes.js';
import itemRoutes from './item.routes.js';
import saleRoutes from './sale.routes.js';
import shopRoutes from './shop.routes.js';
import shopOrderRoutes from './shopOrder.routes.js';

const router = Router();

router.use('/customers', customerRoutes);
router.use('/items', itemRoutes);
router.use('/sales', saleRoutes);
router.use('/shop', shopRoutes);
router.use('/shop/orders', shopOrderRoutes);

export default router;