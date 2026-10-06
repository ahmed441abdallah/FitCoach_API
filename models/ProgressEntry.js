import mongoose from "mongoose";

const progresentrySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    date: { type: Date, default: Date.now },
    weight: { type: Number, required: true },
    bodyFat: { type: Number },
    measurements: {
        chest: { type: Number, required: true },
        waist: { type: Number, required: true },
        bicep: { type: Number, required: true }
    },
    photo: { type: String, required: true }
}, { timestamps: true });

progresentrySchema.index({ user: 1, date: 1 });

const ProgressEntry = mongoose.model("ProgressEntry", progresentrySchema);
export default ProgressEntry;