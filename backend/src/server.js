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
import connectDB from './config/db.js';
import { startAuctionScheduler } from './services/scheduler.js';
import socketHandler from './socketHandler.js';

// 3. Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// 4. MIDDLEWARE
app.use(cors({
    origin: CLIENT_URL,
    credentials: true
}));
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
        origin: CLIENT_URL,
        methods: ["GET", "POST"]
    }
});

    socketHandler(io);
    startAuctionScheduler(io);

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