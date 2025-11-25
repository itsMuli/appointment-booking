import express from 'express';
import { 
  createAppointment, 
  deleteAppointment, 
  getBookedSlots, 
  getUserAppointments, 
  updateAppointmentStatus,
  getAllAppointments
} from '../controllers/appointmentController.js';
import { protect, authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all appointments (admin only)
router.get('/', protect, getAllAppointments);

// Create new appointment
router.post('/', protect, createAppointment);

// Get booked slots for a specific date
router.get('/date/:date', getBookedSlots);

// Get user's appointments
router.get('/my-appointments', authenticate, getUserAppointments);

// Update appointment status
router.patch('/:id/status', protect, updateAppointmentStatus);

// Delete appointment
router.delete('/:id', protect, deleteAppointment);

export default router;
