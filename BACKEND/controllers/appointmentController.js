import Appointment from "../models/appointmentModel.js";
import Service from "../models/serviceModel.js";
import Category from "../models/categoryModel.js";
import nodemailer from "nodemailer";
import {
  notifyJoanNewBooking,
  notifyJoanCancellation,
} from "../helpers/whatsapp.js";

const ACTIVE_STATUSES = { $nin: ['Cancelled', 'Rejected'] };

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
      status: ACTIVE_STATUSES
    });

    if (existingAppointment) {
      return res.status(409).json({
        success: false,
        error: 'This time slot is already booked for the selected artist'
      });
    }

    // Resolve category name (required) — look up from service when client sends ALL / omits category
    let categoryName = category?.name;
    if (!categoryName) {
      const serviceDoc = await Service.findOne({ name: service.name });
      if (serviceDoc?.category) {
        const cat = await Category.findById(serviceDoc.category);
        categoryName = cat?.name;
      }
    }
    if (!categoryName) {
      categoryName = 'General';
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
      category: { name: categoryName },
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

    // WhatsApp Joan for Approve / Reject (non-blocking)
    try {
      await notifyJoanNewBooking(savedAppointment);
    } catch (waErr) {
      console.error('WhatsApp notify Joan failed:', waErr.message);
    }

    // Optional email if SMTP is configured
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
          subject: 'Appointment Request Received - Infinity Nail Salon',
          html: `
            <h2>Booking received</h2>
            <p>Dear ${userDetails.firstname || 'Valued Customer'},</p>
            <p>Your appointment request is <strong>Pending</strong> approval.</p>
            <p><strong>Booking ID:</strong> ${bookingId}</p>
            <p><strong>Service:</strong> ${service.name}</p>
            <p><strong>Artist:</strong> ${artist.name}</p>
            <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${time}</p>
            <p>We will confirm shortly via WhatsApp.</p>
            <p>Best regards,<br>Infinity Nail Salon Team</p>
          `
        });
      } catch (mailErr) {
        console.log('Email send failed:', mailErr.message);
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
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const appointments = await Appointment.find({
      date: { $gte: dayStart, $lte: dayEnd },
      status: ACTIVE_STATUSES
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
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    console.error("Error in getUserAppointments:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['Pending', 'Confirmed', 'Cancelled', 'Rejected'];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Status must be one of: ${allowed.join(', ')}`
      });
    }

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

/** Soft-cancel: keep the record, set status Cancelled, notify Joan */
export const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Users may only cancel their own; admin JWT can cancel any
    const isAdmin = req.user?.role === 'admin';
    if (!isAdmin && String(appointment.userId) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not allowed to cancel this appointment'
      });
    }

    if (['Cancelled', 'Rejected'].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: `Appointment is already ${appointment.status}`
      });
    }

    if (!['Pending', 'Confirmed'].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: 'Only Pending or Confirmed appointments can be cancelled'
      });
    }

    appointment.status = 'Cancelled';
    await appointment.save();

    try {
      await notifyJoanCancellation(appointment);
    } catch (waErr) {
      console.error('WhatsApp cancel notify failed:', waErr.message);
    }

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled',
      data: appointment
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/** Hard delete — admin / cleanup only */
export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

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

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const appointments = await Appointment.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

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
