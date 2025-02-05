import mongoose from 'mongoose';

// Assuming you are defining the Service schema
const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category', // Reference to the Category model
    required: true,
  },
});

const Service = mongoose.model('Service', serviceSchema);
export default Service;
