import AuctionItem from '../models/auctionItem.js';
import { placeBid as placeBidService } from '../services/auctionServices.js';

// 1. Get All Items
export const getItems = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const now = new Date();

    // Sort at the Database level. Active auctions first, then by end time.
    const items = await AuctionItem.aggregate([
      {
        $addFields: {
          activeOrder: { 
            $cond: { 
              if: { $and: [ { $gt: ["$endTime", now] }, { $eq: ["$isClosed", false] } ] }, 
              then: 1, 
              else: 2 
            }
          }
        }
      },
      { $sort: { activeOrder: 1, endTime: 1 } }, 
      { $skip: skip },
      { $limit: limit },
    ]);

    await AuctionItem.populate(items, { path: 'highestBidder', select: 'username' });

    res.json(items);
  } catch (error) {
    console.error("GetItems Error:", error);
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
    if (!amount || typeof amount !== 'number') {
      return res.status(400).json({ message: "Invalid bid amount" });
    }
    
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
            bidHistory: [],
            seller: req.user._id // Save the seller
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