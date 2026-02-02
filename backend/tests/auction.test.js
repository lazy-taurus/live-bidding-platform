import { connect, close, clear } from './setup.js';
import AuctionItem from '../src/models/auctionItem.js';
import User from '../src/models/User.js';
import { placeBid } from '../src/services/auctionServices.js';

// Lifecycle
beforeAll(async () => await connect());
afterEach(async () => await clear());
afterAll(async () => await close());

describe('Auction Service Logic', () => {
    let itemId;
    let userId;

    // Seed data before each test
    beforeEach(async () => {
        const user = await User.create({
            username: 'bidder1',
            email: 'bidder1@test.com',
            password: '123'
        });
        userId = user._id;

        const item = await AuctionItem.create({
            title: 'Test Item',
            currentPrice: 10000, // ₹100
            startingPrice: 10000,
            endTime: new Date(Date.now() + 10000), // Ends in 10s
        });
        itemId = item._id;
    });

    it('should accept a valid higher bid', async () => {
        const result = await placeBid(itemId, 11000, userId); // Bid ₹110
        
        expect(result.success).toBe(true);
        expect(result.item.currentPrice).toBe(11000);
        expect(result.item.highestBidder._id.toString()).toEqual(userId.toString());
    });

    it('should reject a bid lower than current price', async () => {
        const result = await placeBid(itemId, 9000, userId); // Bid ₹90
        
        expect(result.success).toBe(false);
        expect(result.error).toContain('updated or auction ended');
    });

    it('should reject a bid if auction is expired', async () => {
        // Manually expire the item
        await AuctionItem.findByIdAndUpdate(itemId, { endTime: new Date(Date.now() - 1000) });

        const result = await placeBid(itemId, 15000, userId);
        
        expect(result.success).toBe(false);
        expect(result.error).toContain('Bid failed'); 
    });
});