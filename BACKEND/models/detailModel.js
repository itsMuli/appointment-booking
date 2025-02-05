import mongoose from "mongoose"

const detailSchema = new mongoose.Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
  });

const detailModel = mongoose.models.detail || mongoose.model("detail", detailSchema)

export default detailModel