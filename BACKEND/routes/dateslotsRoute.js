import express from 'express';
import {
  createAppointment,
  getSlots,
  getSlotsById,
  getBookedSlotsByDate,
} from '../controllers/dateslotsController.js';

const router = express.Router();

// Route for creating a new appointment
router.post('/create-appointments', createAppointment);

// Route for getting all appointments
router.get('/', getSlots);

// Route for getting a single appointment by ID
router.get('/:id', getSlotsById);

// Route for getting booked slots by date
router.get('/date/:date', getBookedSlotsByDate);

export default router;
