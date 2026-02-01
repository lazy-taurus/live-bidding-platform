import AuctionItem from '../models/auctionItem.js';

// 1. Mock Data (Acts as Database)
const items = [
    new AuctionItem(
        '1', 
        'Sony WH-1000XM5 Headphones', 
        25000, // 25000 paise = ₹250.00
        new Date(Date.now() + 1000 * 60 * 10) 
    ),
    new AuctionItem(
        '2', 
        'MacBook Pro M2', 
        120000, // 120000 paise = ₹1200.00
        new Date(Date.now() + 1000 * 60 * 30)
    ),
];

// 2. Get items
export const getItems = (req, res) => {
    try {
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { items };