import { Router } from 'express';
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  getCustomerCredits
} from '../controllers/customer.controller.js';

const router = Router();

router.get('/', getCustomers);
router.get('/credits/overview', getCustomerCredits);
router.get('/:id', getCustomerById);
router.post('/', createCustomer);
router.put('/:id', updateCustomer);

export default router;