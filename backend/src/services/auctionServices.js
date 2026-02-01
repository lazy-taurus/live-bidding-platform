import { items } from '../controllers/auctionController.js';

// Processes a new bid.
export const placeBid = (itemId, amount, userId) => {
    // SECURITY PATCH 1: Validate Inputs
    if (!itemId || !amount || !userId) {
        return { success: false, error: 'Missing fields' };
    }

    // SECURITY PATCH 2: Type Checking
    if (typeof amount !== 'number') {
        return { success: false, error: 'Bid amount must be a number' };
    }

    // SECURITY PATCH 3: Prevent Negative Bids
    if (amount <= 0) {
        return { success: false, error: 'Bid must be positive' };
    }
    
    // 1. Find the item
    const item = items.find(i => i.id === itemId);
    
    if (!item) {
        return { success: false, error: 'Item not found' };
    }

    // 2. Auction Expired?
    if (new Date() > item.endTime) {
        return { success: false, error: 'Auction has ended' };
    }

    // 3. Check Self-Bidding
    if (item.highestBidder && item.highestBidder.socketId === userId) {
        return { success: false, error: 'You are already the highest bidder' };
    }

    // 4. RACE CONDITION FIX
    if (amount <= item.price) {
        return { success: false, error: 'Bid too low. The price has moved!' };
    }

    // 5. Update the State
    item.price = amount;
    item.highestBidder = { socketId: userId };
    item.version += 1;
    
    // Add to history
    item.bids.push({ userId, amount, timestamp: new Date() });

    return { success: true, item };
};