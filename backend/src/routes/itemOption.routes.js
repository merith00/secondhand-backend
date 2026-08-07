import { Router } from 'express';

import {
  getItemOptions,
  createItemOption,
  deleteItemOption,
} from '../controllers/itemOption.controller.js';

const router = Router();

router.get('/', getItemOptions);
router.post('/', createItemOption);
router.delete('/:id', deleteItemOption);

export default router;