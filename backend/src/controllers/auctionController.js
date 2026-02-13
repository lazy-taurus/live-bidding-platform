import AuctionItem from '../models/auctionItem.js';
import { placeBid as placeBidService } from '../services/auctionServices.js';

// 1. Get All Items
export const getItems = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;
    const now = new Date();

    // Active
    const activeFilter = { 
        isClosed: false, 
        endTime: { $gt: now } 
    };
    
    // Closed
    const closedFilter = { 
        $or: [
            { isClosed: true },
            { endTime: { $lte: now } }
        ]
    };

    const totalActiveCount = await AuctionItem.countDocuments(activeFilter);

    let items = [];

    if (skip < totalActiveCount) {
        const activeItems = await AuctionItem.find(activeFilter)
            .sort({ endTime: 1 }) 
            .skip(skip)
            .limit(limit)
            .populate('highestBidder', 'username')
            .lean();

        items = [...activeItems];

        if (items.length < limit) {
            const remainingLimit = limit - items.length;
            
            const closedItems = await AuctionItem.find(closedFilter)
                .sort({ endTime: 1 }) 
                .skip(0) 
                .limit(remainingLimit)
                .populate('highestBidder', 'username')
                .lean();
            
            items = [...items, ...closedItems];
        }
    } 
    
    else {
        const closedSkip = skip - totalActiveCount;

        items = await AuctionItem.find(closedFilter)
            .sort({ endTime: 1 }) 
            .skip(closedSkip)
            .limit(limit)
            .populate('highestBidder', 'username')
            .lean();
    }

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
      return res.status(400).json({ message: result.message || result.error });
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
        
        // Validation
        if (!title || !startingPrice || !endTime) {
            return res.status(400).json({ message: "Please provide title, startingPrice, and endTime" });
        }
        if (new Date(endTime) <= new Date()) {
            return res.status(400).json({ message: "End time must be in the future" });
        }

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
        const item = await AuctionItem.findById(req.params.id);
        
        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }

        if (item.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to delete this item" });
        }

        await AuctionItem.findByIdAndDelete(req.params.id);
        res.json({ message: 'Item deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting item' });
    }
};