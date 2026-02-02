import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import auctionRoutes from './routes/auctionRoutes.js';
import { placeBid } from './services/auctionServices.js';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';

// Connect to Database
connectDB();

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// 🔒 SOCKET AUTHENTICATION
io.use((socket, next) => {
    // Client will send token in: socket.handshake.auth.token
    const token = socket.handshake.auth.token;

    if (!token) {
        return next(new Error("Authentication error: No token provided"));
    }

    try {
        // Verify user
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded; 
        
        next();
    } catch (err) {
        next(new Error("Authentication error: Invalid token"));
    }
});

io.on('connection', (socket) => {
    console.log('User connected:', socket.user.id);
    
    // EVENT: User places a bid
    socket.on('BID_PLACED', async (payload) => {
        const { itemId, amount } = payload;
        
        const result = await placeBid(itemId, amount, socket.user.id);

        if (result.success) {
            io.emit('UPDATE_BID', result.item);
        } else {
            socket.emit('BID_ERROR', { message: result.error });
        }
    });
    
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.user.id);
    });
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(mongoSanitize());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Routes
app.use('/items', auctionRoutes);
app.use('/api/auth', authRoutes);

// Basic Health Check Route
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Server is running', 
        timestamp: new Date() 
    });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});