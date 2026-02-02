import mongoose from 'mongoose';

const auctionItemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    currentPrice: { type: Number, required: true }, // Store in cents
    startingPrice: { type: Number, required: true },
    endTime: { type: Date, required: true },
    highestBidder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    isClosed: { type: Boolean, default: false },
    
    // Audit Logs
    bidHistory: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        amount: Number,
        time: { type: Date, default: Date.now }
    }],

}, { timestamps: true });

export default mongoose.model('AuctionItem', auctionItemSchema);