import jwt from 'jsonwebtoken';
import { placeBid } from './services/auctionServices.js';

export default function socketHandler(io) {
    // Socket Auth Middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error("Authentication error: No token"));

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = decoded; 
            next();
        } catch (err) {
            next(new Error("Authentication error: Invalid token"));
        }
    });

    io.on('connection', (socket) => {
        // FIX: Handle both "id" (standard) and "_id" (mongo) to be safe
        const userId = socket.user.id || socket.user._id;
        
        // FIX: Join a private room so we can message this specific user later
        socket.join(userId);

        socket.on('BID_PLACED', async (payload) => {
            const { itemId, amount } = payload;
            
            // Use the safe userId variable
            const result = await placeBid(itemId, amount, userId);

            if (result.success) {
                // 1. Update to EVERYONE
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
                socket.emit('BID_ERROR', { itemId, message: result.message || result.error });
            }
        });
        
        socket.on('disconnect', () => {
            // User disconnected, cleanup handled by socket.io
        });
    });
}