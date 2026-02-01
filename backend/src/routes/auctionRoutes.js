import express from 'express';
import { getItems } from '../controllers/auctionController.js';

const router = express.Router();

// GET /items
router.get('/', getItems);

export default router;