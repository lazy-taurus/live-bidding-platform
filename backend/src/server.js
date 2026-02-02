import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
// import mongoSanitize from 'express-mongo-sanitize';

// 1. LOAD ENV VARS FIRST (Critical!)
dotenv.config();

// 2. Import Local Files (after dotenv)
import auctionRoutes from './routes/auctionRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { placeBid } from './services/auctionServices.js'; 
import connectDB from './config/db.js';

// 3. Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);

// 4. MIDDLEWARE
app.use(cors());           
app.use(helmet());         
app.use(express.json());   
// app.use(mongoSanitize());  

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP.'
});
app.use('/api', limiter);

// 5. Socket.io Setup
const io = new Server(server, {
    cors: {
        origin: "*", // In production, change to your frontend URL
        methods: ["GET", "POST"]
    }
});

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
    // console.log('User connected to Socket:', userId);
    
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
                //console.log(`Sending OUTBID alert to: ${result.previousBidderId}`);
                
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
        console.log('User disconnected');
    });
});

// 6. Routes
app.use('/items', auctionRoutes);
app.use('/api/auth', authRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// 7. Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});