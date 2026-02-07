import express from 'express';
import { getItems, getItemById, placeBid, createItem, deleteItem } from '../controllers/auctionController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getItems);
router.get('/:id', getItemById);

// ADMIN ROUTES (PROTECTED)
router.post('/', protect, createItem);
router.delete('/:id', protect, deleteItem);

export default router;