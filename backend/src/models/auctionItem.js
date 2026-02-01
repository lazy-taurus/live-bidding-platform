class AuctionItem {
    constructor(id, title, startingPrice, endTime) {
        this.id = id;
        this.title = title;
        this.price = startingPrice;
        this.highestBidder = null;
        this.endTime = endTime;
        this.bids = [];
        
        // CONCURRENCY CONTROL
        this.version = 0; 
    }
}

export default AuctionItem;