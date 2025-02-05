import Dateslots from '../models/dateslotsModel.js';
import { startOfDay, endOfDay } from 'date-fns';

// Create a new appointment
export const createAppointment = async (req, res) => {
  const { date, timeSlot } = req.body;
  
  try {
    // Convert date from string to Date object
    const dateObject = new Date(date);
    if (isNaN(dateObject)) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    // Check if the time slot is already booked for the selected date
    const existingSlot = await Dateslots.findOne({
      date: dateObject,
      timeSlot,
    });

    if (existingSlot) {
      return res.status(400).json({ error: "This time slot is already booked" });
    }

    // Create a new Dateslots document for the new appointment
    const newDateslots = new Dateslots({
      date: dateObject,
      timeSlot,
    });

    // Save the new appointment
    await newDateslots.save();

    res.status(201).json(newDateslots);
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).json({ error: "Failed to save appointment" });
  }
};

// Get all appointments (optional)
export const getSlots = async (req, res) => {
  try {
    const dateslots = await Dateslots.find();
    res.status(200).json(dateslots);
  } catch (error) {
    console.error("Error retrieving appointments:", error);
    res.status(500).json({ error: 'Failed to retrieve appointments' });
  }
};

// Get a single appointment by ID (optional)
export const getSlotsById = async (req, res) => {
  try {
    const dateslots = await Dateslots.findById(req.params.id);
    if (!dateslots) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.status(200).json(dateslots);
  } catch (error) {
    console.error("Error retrieving appointment by ID:", error);
    res.status(500).json({ error: 'Failed to retrieve appointment' });
  }
};

// Get booked slots for a specific date
export const getBookedSlotsByDate = async (req, res) => {
  try {
    const { date } = req.params;
    
    if (!date) {
      return res.status(400).json({ error: "Date parameter is required" });
    }
    
    // Convert the date from string to Date object
    const dateObject = new Date(date);
    if (isNaN(dateObject)) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    // Find the booked slots for the given date
    const start = startOfDay(dateObject);
    const end = endOfDay(dateObject);
    const dateslots = await Dateslots.find({
      date: { $gte: start, $lt: end },
    });

    // Extract the booked time slots
    const bookedSlots = [...new Set(dateslots.map((slot) => slot.timeSlot))];
    
    res.status(200).json({ bookedSlots });
  } catch (error) {
    console.error("Error retrieving booked slots:", error);
    res.status(500).json({ error: "Failed to retrieve booked slots for the selected date" });
  }
};
