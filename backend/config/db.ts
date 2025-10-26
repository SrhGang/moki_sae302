import mongoose from 'mongoose';

const dbURI = process.env.DB_URI || "mongodb://localhost:27017/moki";

const connectDB = async () => {
    try {
        await mongoose.connect(dbURI);
        console.log("⚡ Connected to MongoDB");
    } catch (error) {
        console.error("❌ Error connecting to MongoDB:", error);
    }
}

export default connectDB;