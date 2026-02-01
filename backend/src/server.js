import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import auctionRoutes from './routes/auctionRoutes.js';

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

// Middleware
app.use(cors());
app.use(express.json());

// Auction Routes
app.use('/items', auctionRoutes);

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