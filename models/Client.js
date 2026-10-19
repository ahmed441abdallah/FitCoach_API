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

// user is already unique in the schema, but an explicit index ensures
// the query planner uses it for findOne({user: req.user._id}) —
// the pattern used by /clients/me and the subscription buyflow.
clientSchema.index({ user: 1 }, { unique: true });

// Admin lists clients sorted newest-first; compound index avoids a sort stage.
clientSchema.index({ createdAt: -1 });

const Client = mongoose.model("Client", clientSchema);
export default Client;