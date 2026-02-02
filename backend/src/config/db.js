import mongoose from 'mongoose';
import dotenv from 'dotenv'; 

// Force load .env just in case server.js didn't do it
dotenv.config(); 

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is missing from .env file!");
        }
        const conn = await mongoose.connect(process.env.MONGO_URI);
        
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ DB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;