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
import { placeBid } from './services/auctionServices.js'; // Fixed: Singular 'Service'
import connectDB from './config/db.js';

// 3. Connect to Database
connectDB();

console.log("🔍 MONGO_URI is:", process.env.MONGO_URI);

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
    console.log('✅ User connected to Socket:', socket.user.username);
    
    socket.on('BID_PLACED', async (payload) => {
        const { itemId, amount } = payload;
        // Pass socket.user.id (from the token)
        const result = await placeBid(itemId, amount, socket.user.id);

        if (result.success) {
            // Broadcast update to EVERYONE
            io.emit('UPDATE_BID', result.item);
        } else {
            // Send error only to the SENDER
            socket.emit('BID_ERROR', { message: result.message });
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
    console.log(`🚀 Server running on port ${PORT}`);
});