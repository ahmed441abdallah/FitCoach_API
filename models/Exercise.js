import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema({
    exerciseId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    bodyPart: {
        type: String,
        required: true
    },
    target: {
        type: String,
        required: true
    },
    equipment: {
        type: String,
        required: true
    },
    gifUrl: {
        type: String
    },
    instructions: [{
        type: String
    }],
    secondaryMuscles: [{
        type: String
    }]
}, { timestamps: true });

export default mongoose.model("Exercise", exerciseSchema);