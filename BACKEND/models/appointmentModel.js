import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: [true, 'Booking ID is required'],
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    artist: {
      id: {
        type: String,
        required: [true, 'Artist ID is required'],
      },
      name: {
        type: String,
        required: [true, 'Artist name is required'],
      },
    },
    service: {
      name: {
        type: String,
        required: [true, 'Service name is required'],
      },
      price: {
        type: Number,
        required: [true, 'Service price is required'],
      },
    },
    category: {
      name: {
        type: String,
        required: [true, 'Category name is required'],
      },
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Cancelled'],
      default: 'Pending',
    },
    paymentMethod: {
      type: String,
      enum: ['mpesa', 'cash', 'card'],
      default: 'mpesa',
    },
    userDetails: {
      firstname: {
        type: String,
        required: [true, 'First name is required'],
      },
      lastname: {
        type: String,
        required: [true, 'Last name is required'],
      },
      email: {
        type: String,
        required: [true, 'Email is required'],
      },
      phone: {
        type: String,
        required: [true, 'Phone number is required'],
      },
    },
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt`
  }
);

// Indexes for performance
appointmentSchema.index({ userId: 1 });
appointmentSchema.index({ bookingId: 1 }, { unique: true });
appointmentSchema.index({ date: 1 });

// Virtual for full name
appointmentSchema.virtual('userDetails.fullname').get(function () {
  return `${this.userDetails.firstname} ${this.userDetails.lastname}`;
});

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;