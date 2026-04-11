import { Router } from 'express';
import customerRoutes from './customer.routes.js';
import itemRoutes from './item.routes.js';
const router = Router();
router.use('/customers', customerRoutes);
router.use('/items', itemRoutes);
export default router;
