import mongoose from "mongoose";


const serviceSchema = new mongoose.Schema({
  id: String,
  name:{
    type:String, 
    required: true},
  duration: {
    type:String, 
    required: true},
  categoryId: String,
  price: {
    type:Number,
    required:true}
});

const CategorySchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      trim: true
    },
    categoryId:{
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    services: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service"}]
  });

  
  const Category = mongoose.model('Category', CategorySchema);
  export default Category