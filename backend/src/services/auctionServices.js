import AuctionItem from '../models/auctionItem.js';

export const placeBid = async (itemId, amount, userId) => {
    // 1. Basic Validation
    if (amount <= 0) return { success: false, error: 'Bid must be positive' };

    // 2. ATOMIC UPDATE
    const originalItem = await AuctionItem.findOneAndUpdate(
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
        { new: false } // <--- KEY FIX: Return the OLD document
    );

    if (!originalItem) {
        return { success: false, error: 'Bid failed: Price updated or auction ended.' };
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