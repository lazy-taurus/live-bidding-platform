import AuctionItem from '../models/auctionItem.js';
import { placeBid as placeBidService } from '../services/auctionServices.js';

// 1. Get All Items
export const getItems = async (req, res) => {
  try {
    const items = await AuctionItem.find().populate('highestBidder', 'username');
    
    // Sort: active items first (by endTime ascending), then ended items
    const now = new Date();
    items.sort((a, b) => {
      const aIsEnded = a.isClosed || a.endTime < now;
      const bIsEnded = b.isClosed || b.endTime < now;
      
      if (aIsEnded !== bIsEnded) {
        return aIsEnded ? 1 : -1;
      }
      
      return a.endTime - b.endTime;
    });
    
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

// 4. Create New Item
export const createItem = async (req, res) => {
    try {
        const { title, description, startingPrice, endTime, imageUrl } = req.body;
        
        const newItem = new AuctionItem({
            title,
            description,
            currentPrice: startingPrice,
            startingPrice,
            endTime,
            imageUrl,
            highestBidder: null,
            bidHistory: []
        });

        await newItem.save();
        res.status(201).json(newItem);
    } catch (error) {
        res.status(500).json({ message: 'Error creating item' });
    }
};

// 5. Delete Item
export const deleteItem = async (req, res) => {
    try {
        await AuctionItem.findByIdAndDelete(req.params.id);
        res.json({ message: 'Item deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting item' });
    }
};