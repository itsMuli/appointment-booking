import mongoose from 'mongoose';

const artistSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type:String,
        unique: true,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      }
})

const artistModel = mongoose.models.artist || mongoose.model("artist", artistSchema)
export default artistModel