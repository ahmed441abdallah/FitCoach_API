import mongoose from "mongoose";

const workoutPlanSchema = new mongoose.Schema({
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    planName: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 100
    },
    description: {
        type: String,
        maxlength: 500
    },
    days: [{
        dayName: {
            type: String,
            required: true
        },

        exercises: [{
            exerciseId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Exercise",
                required: true
            },
            sets: {
                type: Number,
                required: true,
                min: 1,
                max: 10
            },
            reps: {
                type: Number,
                required: true,
                min: 1
            },
            restTimeMinutes: {
                type: Number,
                default: 2,
                min: 0
            },

            _id: false // ✅ منع ObjectId auto
        }]
    }],

    notes: {
        type: String,
        maxlength: 1000
    }
}, { timestamps: true });

workoutPlanSchema.index({ client: 1, isActive: 1 });
const WorkoutPlan = mongoose.model("WorkoutPlan", workoutPlanSchema);
export default WorkoutPlan;

