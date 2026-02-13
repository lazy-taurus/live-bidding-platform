import jwt from 'jsonwebtoken';
import { bidQueue } from './services/bidQueue.js';

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
        const userId = socket.user.id || socket.user._id;
        socket.join(userId);

        socket.on('BID_PLACED', async (payload) => {
            const { itemId, amount } = payload;
            
            // ✅ FAST PATH: Push to Redis Queue and free up the socket thread instantly
            await bidQueue.add('process-bid', {
                itemId,
                amount,
                userId
            });
            
            // Note: We no longer await placeBid() or emit events here. 
            // The worker in bidQueue.js will handle the emits once the DB is safely updated.
        });
        
        socket.on('disconnect', () => {
            // User disconnected, cleanup handled by socket.io
        });
    });
}