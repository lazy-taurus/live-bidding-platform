import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import auctionRoutes from './routes/auctionRoutes.js';
import { placeBid } from './services/auctionServices.js';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';

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

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    // EVENT: User places a bid
    socket.on('BID_PLACED', (payload) => {
        const { itemId, amount } = payload;
        
        const result = placeBid(itemId, amount, socket.id);
        
        if (result.success) {
            // SUCCESS: New price to EVERYONE
            io.emit('UPDATE_BID', result.item);
        } else {
            // FAILURE: Send error to failed person
            socket.emit('BID_ERROR', { message: result.error });
        }
    });
    
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
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