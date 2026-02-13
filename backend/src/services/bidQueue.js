// backend/src/services/bidQueue.js
import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { placeBid } from './auctionServices.js';

const redisConfig = { maxRetriesPerRequest: null };

const connection = process.env.REDIS_URL 
    ? new IORedis(process.env.REDIS_URL, redisConfig)
    : new IORedis({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        ...redisConfig
    });

// Initialize the Queue (Producer)
export const bidQueue = new Queue('bids', { connection });

// Initialize the Worker (Consumer)
export const startBidWorker = (io) => {
    const worker = new Worker('bids', async (job) => {
        const { itemId, amount, userId } = job.data;
        
        // Execute the actual DB transaction here
        const result = await placeBid(itemId, amount, userId);
        
        // Return data to the 'completed' listener below
        return { result, userId, itemId };
        
    }, { connection });

    // Handle Completed Jobs & Emit Socket Events
    worker.on('completed', (job, returnvalue) => {
        const { result, userId, itemId } = returnvalue;

        if (result.success) {
            // 1. Update EVERYONE
            io.emit('UPDATE_BID', result.item);

            // 2. Notify the VICTIM
            if (result.previousBidderId && result.previousBidderId !== userId) {
                io.to(result.previousBidderId).emit('AUCTION_OUTBID', { 
                    itemId: result.item._id,
                    newItem: result.item
                });
            }
        } else {
            // Send error only to the SENDER
            io.to(userId).emit('BID_ERROR', { 
                itemId, 
                message: result.message || result.error 
            });
        }
    });

    worker.on('failed', (job, err) => {
        console.error(`Job ${job.id} failed:`, err);
    });

    console.log("Redis Bid Worker started.");
};