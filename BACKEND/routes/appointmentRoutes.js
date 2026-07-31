import express from 'express';
import {
  createAppointment,
  deleteAppointment,
  cancelAppointment,
  getBookedSlots,
  getUserAppointments,
  updateAppointmentStatus,
  getAllAppointments
} from '../controllers/appointmentController.js';
import { protect, authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getAllAppointments);
router.post('/', protect, createAppointment);
router.get('/date/:date', getBookedSlots);
router.get('/my-appointments', authenticate, getUserAppointments);
router.patch('/:id/status', protect, updateAppointmentStatus);
router.patch('/:id/cancel', protect, cancelAppointment);
router.delete('/:id', protect, deleteAppointment);

export default router;
