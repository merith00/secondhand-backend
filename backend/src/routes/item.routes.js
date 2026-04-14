import { Router } from 'express';
import {
  getItems,
  getItemById,
  createItem,
  updateItem,
  updateItemStatus,
  uploadItemImage,
  deleteItemImage
} from '../controllers/item.controller.js';
import uploadItemImageMiddleware from '../middleware/uploadItemImage.js';

const router = Router();

router.get('/', getItems);
router.get('/:id', getItemById);
router.post('/', createItem);
router.put('/:id', updateItem);
router.patch('/:id/status', updateItemStatus);

router.post('/:id/image', uploadItemImageMiddleware.single('image'), uploadItemImage);
router.delete('/:id/image', deleteItemImage);

export default router;