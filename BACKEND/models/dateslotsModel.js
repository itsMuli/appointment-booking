import mongoose from 'mongoose';

const dateSlotSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true }, // Stores individual time slots (e.g., "9:00 AM")
});

const Dateslots = mongoose.model('Dateslots', dateSlotSchema);

export default Dateslots;
