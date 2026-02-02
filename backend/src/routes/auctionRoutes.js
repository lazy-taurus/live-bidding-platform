import express from 'express';
import { getItems, getItemById, placeBid, createItem, deleteItem } from '../controllers/auctionController.js';

const router = express.Router();

router.get('/', getItems);
router.get('/:id', getItemById);

// ADMIN ROUTES (Just for testing purposes)
router.post('/', createItem);
router.delete('/:id', deleteItem);

export default router;