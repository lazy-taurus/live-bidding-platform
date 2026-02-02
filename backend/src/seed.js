import mongoose from 'mongoose';
import dotenv from 'dotenv';
import AuctionItem from './models/auctionItem.js';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();

connectDB();

const seedData = async () => {
    try {
        // Clear existing data
        await AuctionItem.deleteMany({});
        console.log('🧹 Old auction items cleared...');

        // Define the items
        const items = [
            {
                title: 'Sony WH-1000XM5 Headphones',
                description: 'Industry-leading noise canceling headphones with 30-hour battery life.',
                currentPrice: 25000, // ₹250.00
                startingPrice: 25000,
                endTime: new Date(Date.now() + 1000 * 60 * 60 * 24), // Ends in 24 hours
                isClosed: false
            },
            {
                title: 'MacBook Pro M2 (14-inch)',
                description: 'Apple M2 Pro chip, 16GB RAM, 512GB SSD. Space Gray.',
                currentPrice: 120000, // ₹1200.00
                startingPrice: 120000,
                endTime: new Date(Date.now() + 1000 * 60 * 30), // Ends in 30 minutes
                isClosed: false
            },
            {
                title: 'Vintage 1990s Mechanical Keyboard',
                description: 'Rare find. Cherry MX Blue switches. Mint condition.',
                currentPrice: 5000, // ₹50.00
                startingPrice: 5000,
                endTime: new Date(Date.now() + 1000 * 60 * 5), // Ends in 5 minutes (Good for testing "Out of Time")
                isClosed: false
            }
        ];

        // Insert into DB
        await AuctionItem.insertMany(items);
        console.log('✅ Database seeded successfully!');

        process.exit();
    } catch (error) {
        console.error(`❌ Error seeding database: ${error.message}`);
        process.exit(1);
    }
};

seedData();