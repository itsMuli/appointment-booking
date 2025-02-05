import express, { json } from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import 'dotenv/config';
import colors from 'colors';
import cors from 'cors';
import connectDB from './config/db.js';
import userRouter from './routes/userRoutes.js';
import detailRoutes from './routes/detailRoutes.js';
import artistRouter from './routes/artistRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import dateslotsRoutes from './routes/dateslotsRoute.js';
import appointmentRoutes from './routes/appointmentRoutes.js'

dotenv.config()
console.log('MONGODB_URL from env:', process.env.MONGODB_URL);

connectDB();

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(cors({
  origin: '*',
  credentials: true
}));

app.use('/api/user', userRouter);
app.use('/api', userRouter);
app.use('/api/artist', artistRouter);
app.use('/api/services', serviceRoutes);
app.use('/api/categories', categoryRoutes);
// app.use('/api/appointment', dateslotsRoutes);
app.use('/api/details', detailRoutes);
app.use('/api/appointment', appointmentRoutes);

app.get('/', (req,res) => {
  res.send("Welcome to InfinityNailSalon")
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`.bgCyan.white);
});