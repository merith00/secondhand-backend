import { Router } from 'express';
import {
    getItems,
    getItemById,
    createItem,
    updateItem,
    updateItemStatus
} from '../controllers/item.controller.js';
const router = Router();
router.get('/', getItems);
router.get('/:id', getItemById);
router.post('/', createItem);
router.put('/:id', updateItem);
router.patch('/:id/status', updateItemStatus);
export default router;
