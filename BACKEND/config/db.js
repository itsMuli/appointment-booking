import mongoose from 'mongoose';
import colors from 'colors';

const sanitizeMongoUrl = (raw) => {
  if (!raw) return '';
  return String(raw)
    .trim()
    .replace(/^["']|["']$/g, '')
    .replace(/\s+/g, '');
};

const connectDB = async () => {
  try {
    const mongoUrl = sanitizeMongoUrl(
      process.env.MONGODB_URL || process.env.MONGO_URL || process.env.DATABASE_URL
    );

    if (!mongoUrl) {
      console.error(
        'MongoDB connection error: MONGODB_URL is missing. Set it in Render Environment.'
      );
      return false;
    }

    // Log host only — never the full credentials
    try {
      const host = new URL(mongoUrl.replace('mongodb+srv', 'https')).host;
      console.log('Connecting to MongoDB host:', host);
    } catch {
      console.log('Connecting to MongoDB...');
    }

    const conn = await mongoose.connect(mongoUrl);
    console.log(
      `MongoDB connected successfully ${conn.connection.host}`.bgMagenta.white
    );
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error.message || error);
    return false;
  }
};

export default connectDB;
