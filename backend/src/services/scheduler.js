import AuctionItem from '../models/auctionItem.js';

export const startAuctionScheduler = (io) => {
    console.log("Auction Scheduler Started...");

    // Run every 10 seconds
    setInterval(async () => {
        try {
            const now = new Date();

            const expiredItems = await AuctionItem.find({
                endTime: { $lte: now },
                isClosed: false
            }).populate('highestBidder', 'username');

            if (expiredItems.length > 0) {
                console.log(`Closing ${expiredItems.length} expired auctions...`);
                
                for (const item of expiredItems) {
                    item.isClosed = true;
                    await item.save();

                    io.emit('UPDATE_BID', item); 
                    
                    if (item.highestBidder) {
                        io.to(item.highestBidder._id.toString()).emit('AUCTION_WON', {
                            item: item,
                            message: `Congratulations! You won ${item.title}`
                        });
                    }
                }
            }
        } catch (error) {
            console.error("❌ Scheduler Error:", error);
        }
    }, 10000);
};