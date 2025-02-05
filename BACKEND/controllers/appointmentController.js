import mongoose from "mongoose";
import Appointment from "../models/appointmentModel.js";

export const createAppointment = async (req, res) => {
  try {
    const {
      artist,
      service,
      category,
      date,
      time,
      paymentMethod,
      userDetails
    } = req.body;

    if (!artist || !service || !date || !time) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        received: { artist, service, date, time }
      });
    }

    // Generate unique booking ID
    const bookingId = 'BK' + Date.now().toString().slice(-6);

    const appointmentData = {
      bookingId,
      userId: req.user._id,
      artist: {
        id: artist.id,
        name: artist.name
      },
      service: {
        name: service.name,
        price: service.price
      },
      category: category ? { name: category.name } : undefined,
      date: new Date(date),
      timeSlot: time,
      paymentMethod: paymentMethod || 'mpesa',
      userDetails,
      status: 'Pending'
    };

    console.log('Creating appointment with data:', appointmentData);

    const appointment = new Appointment(appointmentData);
    const savedAppointment = await appointment.save();

    console.log('Appointment saved successfully:', savedAppointment);

    res.status(201).json({
      success: true,
      data: savedAppointment
    });
  } catch (error) {
    console.error('Detailed error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const getBookedSlots = async (req, res) => {
  try {
    const { date } = req.params;
    const appointments = await Appointment.find({
      date: new Date(date),
      status: { $ne: 'cancelled' }
    });

    const bookedSlots = appointments.map(appointment => appointment.timeSlot);

    res.status(200).json({
      success: true,
      bookedSlots
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const getUserAppointments = async (req, res) => {
  try {
    console.log("Fetching appointments for user:", req.user._id); // Debugging
    const appointments = await Appointment.find({ userId: req.user._id })
      // .populate('artistId', 'name')
      // .populate('serviceId', 'name price')
      .sort({ createdAt: -1 });

    console.log("Appointments found:", appointments); // Debugging
    res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    console.error("Error in getUserAppointments:", error); // Debugging
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the appointment exists
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Delete the appointment
    await Appointment.findByIdAndDelete(id);

    res.status(200).json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
