import mongoose from "mongoose";

const workoutLogSchema = new mongoose.Schema({
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    workoutPlan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "WorkoutPlan",
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    dayName: {
        type: String,
        required: true,
    },
    durationMinutes: {
        type: Number,
    },
    exercises: [{
        exerciseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Exercise",
            required: true
        },
        sets: [{
            reps: {
                type: Number,
                required: true,
                min: 0
            },
            weight: {
                type: Number,
                required: true,
                min: 0
            }
        }],
        exerciseNotes: {
            type: String,
            maxlength: 200
        },
        _id: false
    }],
    overallMood: {
        type: String,
        enum: ["Excellent", "Good", "Normal", "Tired", "Bad"],
    },
    generalNotes: {
        type: String,
        maxlength: 500
    }
}, { timestamps: true });

workoutLogSchema.index({ client: 1, date: -1 });

const WorkoutLog = mongoose.model("WorkoutLog", workoutLogSchema);
export default WorkoutLog;