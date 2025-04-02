
import mongoose from 'mongoose';

const MONGODB_URI = "mongodb+srv://IFRIHACKATON:20242025@cluster0.hkeivcu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

export async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}
