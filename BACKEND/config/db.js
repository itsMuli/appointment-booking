import mongoose from 'mongoose';
import colors from 'colors';

const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB:', process.env.MONGODB_URL);
    const conn = await mongoose.connect(`${process.env.MONGODB_URL}/nailspa`);
    console.log(`MongoDB connected successfully ${conn.connection.host}`.bgMagenta.white);
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};


export default connectDB;