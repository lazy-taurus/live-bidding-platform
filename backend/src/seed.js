import mongoose from 'mongoose';
import dotenv from 'dotenv';
import AuctionItem from './models/auctionItem.js';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();

connectDB();

const seedData = async () => {
    try {
        // 1. Clear existing data
        await AuctionItem.deleteMany({});
        await User.deleteMany({});
        console.log('Old data cleared...');

        // 2. Create Users
        const user1 = await User.create({
            username: 'Alice_Seller',
            email: 'alice@example.com',
            password: 'password123'
        });

        const user2 = await User.create({
            username: 'Bob_Seller',
            email: 'bob@example.com',
            password: 'password123'
        });

        console.log(`Users created: ${user1.username} & ${user2.username}`);

        // 3. Define the items
        const items = [
            // Item 1: Ends in 5 minutes
            {
                title: 'Vintage 1990s Mechanical Keyboard',
                description: 'Rare find. Cherry MX Blue switches. Mint condition.',
                currentPrice: 5000, 
                startingPrice: 5000,
                endTime: new Date(Date.now() + 1000 * 60 * 5), 
                seller: user1._id,
                isClosed: false
            },
            // Item 2: Ends in 30 minutes
            {
                title: 'MacBook Pro M2 (14-inch)',
                description: 'Apple M2 Pro chip, 16GB RAM, 512GB SSD. Space Gray.',
                currentPrice: 120000, 
                startingPrice: 120000,
                endTime: new Date(Date.now() + 1000 * 60 * 30), 
                seller: user2._id,
                isClosed: false
            },
            // Item 3: Ends in 24 hours
            {
                title: 'Sony WH-1000XM5 Headphones',
                description: 'Industry-leading noise canceling headphones with 30-hour battery life.',
                currentPrice: 25000, 
                startingPrice: 25000,
                endTime: new Date(Date.now() + 1000 * 60 * 60 * 24), 
                seller: user1._id,
                isClosed: false
            },
            // Item 4: Ends in 48 hours
            {
                title: 'PlayStation 5 Console',
                description: 'Next-gen gaming. 4K 120Hz support. Includes 2 controllers.',
                currentPrice: 45000,
                startingPrice: 45000,
                endTime: new Date(Date.now() + 1000 * 60 * 60 * 48),
                seller: user2._id,
                isClosed: false
            },
            // Item 5: Ended 1 hour ago
            {
                title: 'Rolex Submariner Date',
                description: 'Classic diver watch. Stainless steel. 41mm. (Sold)',
                currentPrice: 850000,
                startingPrice: 800000,
                endTime: new Date(Date.now() - 1000 * 60 * 60), 
                seller: user1._id,
                isClosed: true
            }
        ];

        // 4. Insert into DB
        await AuctionItem.insertMany(items);
        console.log('5 Auction Items created successfully!');

        process.exit();
    } catch (error) {
        console.error(`Error seeding database: ${error.message}`);
        process.exit(1);
    }
};

seedData();