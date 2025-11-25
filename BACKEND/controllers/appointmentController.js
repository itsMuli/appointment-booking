import mongoose from "mongoose";
import Appointment from "../models/appointmentModel.js";
import nodemailer from "nodemailer";

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

    // Check for double-booking: same artist, same date, same time slot
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const existingAppointment = await Appointment.findOne({
      'artist.id': artist.id,
      date: { $gte: dayStart, $lte: dayEnd },
      timeSlot: time,
      status: { $ne: 'Cancelled' }
    });

    if (existingAppointment) {
      return res.status(409).json({
        success: false,
        error: 'This time slot is already booked for the selected artist'
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

    // Send email notification if email configuration exists
    if (userDetails?.email && process.env.SMTP_HOST) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });

        await transporter.sendMail({
          from: process.env.SMTP_FROM || 'no-reply@infinitynailsalon.com',
          to: userDetails.email,
          subject: 'Appointment Confirmation - Infinity Nail Salon',
          html: `
            <h2>Appointment Confirmed!</h2>
            <p>Dear ${userDetails.name || 'Valued Customer'},</p>
            <p>Your appointment has been successfully booked.</p>
            <p><strong>Booking ID:</strong> ${bookingId}</p>
            <p><strong>Service:</strong> ${service.name}</p>
            <p><strong>Artist:</strong> ${artist.name}</p>
            <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${time}</p>
            <p><strong>Price:</strong> $${service.price}</p>
            <p>We look forward to seeing you!</p>
            <p>Best regards,<br>Infinity Nail Salon Team</p>
          `
        });
        console.log('Confirmation email sent to:', userDetails.email);
      } catch (mailErr) {
        console.log('Email send failed:', mailErr.message);
        // Don't fail the appointment creation if email fails
      }
    }

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
    const targetUserId = (req.user?.role === 'admin' && (req.query.userId || req.params.userId))
      ? (req.query.userId || req.params.userId)
      : req.user._id;
    const appointments = await Appointment.find({ userId: targetUserId })
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
      return res.status(404).json({ 
        success: false,
        message: 'Appointment not found' 
      });
    }

    // Delete the appointment
    await Appointment.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Appointment deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
};

// Get all appointments (for admin dashboard)
export const getAllAppointments = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      status, 
      date, 
      artist,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      filter.date = { $gte: startDate, $lt: endDate };
    }
    if (artist) {
      filter['artist.name'] = { $regex: artist, $options: 'i' };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get appointments with pagination
    const appointments = await Appointment.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Appointment.countDocuments(filter);

    res.status(200).json({
      success: true,
      appointments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments'
    });
  }
};






