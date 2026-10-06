import mongoose from "mongoose";
const clientSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },

  goals: {
    type: String,
    required: true
  },
  height: {
    type: String,
    required: true
  },
  currentWeight: {
    type: String,
    required: true
  },
  targetWeight: {
    type: String,
    required: true
  },
  trainingDaysPerWeek: {
    type: String,
    required: true
  },

  age: {
    type: Number,
    required: true
  },

  experienceLevel: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced"],
    required: true
  },
  injuriesOrRestrictions: {
    type: String,
  },
  foodPreferences: {
    type: String,
  },
  images: {
    type: [String],
    default: []
  },
  subscriptionPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Package",
    default: null
  },



}, { timestamps: true });

const Client = mongoose.model("Client", clientSchema);
export default Client;