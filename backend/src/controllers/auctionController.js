import AuctionItem from '../models/auctionItem.js';
import { placeBid as placeBidService } from '../services/auctionServices.js';

// 1. Get All Items
export const getItems = async (req, res) => {
  try {
    const items = await AuctionItem.find().populate('highestBidder', 'username');
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// 2. Get Single Item
export const getItemById = async (req, res) => {
  try {
    const item = await AuctionItem.findById(req.params.id).populate('highestBidder', 'username');
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// 3. Place Bid
export const placeBid = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    
    const result = await placeBidService(id, amount, req.user._id);

    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }

    res.json(result.item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};