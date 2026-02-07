import AuctionItem from '../models/auctionItem.js';

export const placeBid = async (itemId, amount, userId) => {
    // 1. Basic Validation
    if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
        return { success: false, error: 'Bid must be a valid positive number' };
    }

    // 2. ATOMIC UPDATE
    const originalItem = await AuctionItem.findOneAndUpdate(
        { 
            _id: itemId, 
            endTime: { $gt: new Date() }, // not expired
            currentPrice: { $lt: amount }, // new bid > current price
            highestBidder: { $ne: userId },
            seller: { $ne: userId }
        },
        { 
            $set: { 
                currentPrice: amount, 
                highestBidder: userId 
            },
            $push: { 
                bidHistory: { user: userId, amount: amount } 
            }
        },
        { new: false } // <--- KEY FIX: Return the OLD document
    );

    if (!originalItem) {
        const item = await AuctionItem.findById(itemId);

        if (!item) return { success: false, error: 'Item not found' };
        if (item.isClosed || new Date(item.endTime) <= new Date()) return { success: false, error: 'Auction has ended' };
        if (item.seller.toString() === userId.toString()) return { success: false, error: 'You cannot bid on your own auction' };
        if (item.highestBidder?.toString() === userId.toString()) return { success: false, error: 'You are already the highest bidder' };
        if (item.currentPrice >= amount) return { success: false, error: 'Bid too low - price updated' };

        return { success: false, error: 'Bid failed' };
    }

    // 3. Determine the Victim
    const previousBidderId = originalItem.highestBidder 
        ? originalItem.highestBidder.toString() 
        : null;

    // 4. Get Fresh Data for Frontend
    const updatedItem = await AuctionItem.findById(itemId)
        .populate('highestBidder', 'username');

    return { 
        success: true, 
        item: updatedItem, 
        previousBidderId 
    };
};