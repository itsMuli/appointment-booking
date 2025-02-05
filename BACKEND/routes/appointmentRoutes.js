import express from 'express';
import { createAppointment, deleteAppointment, getBookedSlots, getUserAppointments, updateAppointmentStatus } from '../controllers/appointmentController.js';
import { protect, authenticate } from '../middleware/auth.js';


const router = express.Router();

router.post('/', protect, createAppointment);
router.get('/date/:date', getBookedSlots);
router.get('/my-appointments',authenticate,  getUserAppointments);
router.patch('/:id/status', protect, updateAppointmentStatus);
router.delete('/:id', deleteAppointment)

export default router;
