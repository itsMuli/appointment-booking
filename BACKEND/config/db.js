import mongoose from 'mongoose';
import colors from 'colors';

const sanitizeMongoUrl = (raw) => {
  if (!raw) return '';

  let url = String(raw)
    .replace(/^\uFEFF/, '') // BOM
    .trim();

  // Strip wrapping quotes repeatedly (common Render/UI paste issue)
  while (
    (url.startsWith('"') && url.endsWith('"')) ||
    (url.startsWith("'") && url.endsWith("'"))
  ) {
    url = url.slice(1, -1).trim();
  }

  // If someone pasted `MONGODB_URL=mongodb+srv://...` into the value field
  url = url.replace(/^MONGODB_URL\s*=\s*/i, '').trim();

  // Remove accidental whitespace inside the URI
  url = url.replace(/\s+/g, '');

  // If scheme is buried after junk, keep from first mongodb occurrence
  const srvIdx = url.indexOf('mongodb+srv://');
  const stdIdx = url.indexOf('mongodb://');
  if (srvIdx > 0) url = url.slice(srvIdx);
  else if (stdIdx > 0) url = url.slice(stdIdx);

  return url;
};

const connectDB = async () => {
  try {
    const raw =
      process.env.MONGODB_URL ||
      process.env.MONGO_URL ||
      process.env.DATABASE_URL;

    const mongoUrl = sanitizeMongoUrl(raw);

    if (!mongoUrl) {
      console.error(
        'MongoDB connection error: MONGODB_URL is missing. Set it in Render → Environment.'
      );
      return false;
    }

    if (!/^mongodb(\+srv)?:\/\//i.test(mongoUrl)) {
      const preview = mongoUrl.slice(0, 24).replace(/./g, (ch, i) =>
        i < 12 ? ch : '*'
      );
      console.error(
        `MongoDB connection error: invalid scheme. Value must start with mongodb:// or mongodb+srv://. Got preview: "${preview}..." (length=${mongoUrl.length}). Re-set MONGODB_URL in Render without quotes.`
      );
      return false;
    }

    try {
      const host = new URL(mongoUrl.replace(/^mongodb\+srv/i, 'https')).host;
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
