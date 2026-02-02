import AuctionItem from '../models/auctionItem.js';

export const placeBid = async (itemId, amount, userId) => {
    // 1. Basic Validation
    if (amount <= 0) return { success: false, error: 'Bid must be positive' };

    // 2. ATOMIC UPDATE
    const updatedItem = await AuctionItem.findOneAndUpdate(
        { 
            _id: itemId, 
            endTime: { $gt: new Date() }, // not expired
            currentPrice: { $lt: amount } // new bid > current price
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
        { new: true }
    ).populate('highestBidder', 'username');

    if (!updatedItem) {
        return { success: false, error: 'Bid failed: Price updated or auction ended.' };
    }

    return { success: true, item: updatedItem };
};