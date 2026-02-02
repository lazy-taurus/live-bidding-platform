import { connect, close, clear } from './setup.js';
import AuctionItem from '../src/models/auctionItem.js';
import User from '../src/models/User.js';
import { placeBid } from '../src/services/auctionServices.js';

// Setup Lifecycle
beforeAll(async () => await connect());
afterEach(async () => await clear());
afterAll(async () => await close());

describe('🔥 Concurrency & Race Conditions', () => {
    let itemId;
    let userA_Id;
    let userB_Id;

    beforeEach(async () => {
        // 1. Create Two Bidders
        const userA = await User.create({ username: 'Alice', email: 'alice@test.com', password: '123' });
        const userB = await User.create({ username: 'Bob', email: 'bob@test.com', password: '123' });
        userA_Id = userA._id;
        userB_Id = userB._id;

        // 2. Create Item
        const item = await AuctionItem.create({
            title: 'Gold Bar',
            currentPrice: 10000,
            startingPrice: 10000,
            endTime: new Date(Date.now() + 60000), // 1 min from now
        });
        itemId = item._id;
    });

    it('should handled simultaneous identical bids correctly (The Race)', async () => {
        // SCENARIO:
        
        const bidAmount = 11000;

        console.log('🚀 Firing two bids simultaneously...');

        // Promise.all runs these in parallel
        const [resultA, resultB] = await Promise.all([
            placeBid(itemId, bidAmount, userA_Id),
            placeBid(itemId, bidAmount, userB_Id)
        ]);

        // LOGIC CHECK:
        const successes = [resultA.success, resultB.success].filter(s => s === true).length;
        const failures = [resultA.success, resultB.success].filter(s => s === false).length;

        console.log(`Results: Successes=${successes}, Failures=${failures}`);

        // Expectation 1:
        expect(successes).toBe(1);
        expect(failures).toBe(1);

        // Expectation 2:
        const finalItem = await AuctionItem.findById(itemId);
        expect(finalItem.currentPrice).toBe(11000);
        
        // Expectation 3:
        expect(finalItem.bidHistory.length).toBe(1);
    });
});