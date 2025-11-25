import express from 'express';
import {
  getDashboardStats,
  getRevenueData,
  getAppointmentTrends,
  getPopularServices,
  getArtistPerformance
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All analytics routes require authentication
router.use(protect);

// Dashboard statistics
router.get('/dashboard', getDashboardStats);

// Revenue data for charts
router.get('/revenue', getRevenueData);

// Appointment trends
router.get('/appointments', getAppointmentTrends);

// Popular services
router.get('/popular-services', getPopularServices);

// Artist performance
router.get('/artist-performance', getArtistPerformance);

export default router;