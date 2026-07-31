import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import 'dotenv/config';
import colors from 'colors';
import cors from 'cors';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import userRouter from './routes/userRoutes.js';
import detailRoutes from './routes/detailRoutes.js';
import artistRouter from './routes/artistRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import dateslotsRoutes from './routes/dateslotsRoute.js';
import appointmentRoutes from './routes/appointmentRoutes.js'
import analyticsRoutes from './routes/analyticsRoutes.js'

dotenv.config();

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(cors({
  origin: '*',
  credentials: true
}));

app.use('/api/user', userRouter);
app.use('/api/artist', artistRouter);
app.use('/api/services', serviceRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/dateslots', dateslotsRoutes);
app.use('/api/details', detailRoutes);
app.use('/api/appointment', appointmentRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to InfinityNailSalon');
});

app.get('/api/health', (req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const readyState = mongoose.connection.readyState;
  res.status(readyState === 1 ? 200 : 503).json({
    ok: readyState === 1,
    db: states[readyState] || String(readyState),
    hasMongoUrl: Boolean(
      process.env.MONGODB_URL || process.env.MONGO_URL || process.env.DATABASE_URL
    ),
  });
});

const PORT = process.env.PORT || 5000;

const start = async () => {
  const connected = await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`.bgCyan.white);
    if (!connected) {
      console.error(
        'WARNING: MongoDB is not connected. Login and booking will fail until MONGODB_URL is set and Atlas allows Render IPs (0.0.0.0/0).'
      );
    }
  });
};

start();
