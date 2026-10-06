import mongoose from "mongoose";
const dietPlanSchema = new mongoose.Schema({
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    description: {
        type: String,
        required: true
    },
    totalCalories: {
        type: Number,
        required: true
    },
    macros: {
        protein: {
            type: Number,
            required: true
        },
        carbs: {
            type: Number,
            required: true
        },
        fats: {
            type: Number,
            required: true
        }
    },
    meals: [{
        mealName: {
            type: String,
            required: true
        },
        mealDescription: {
            type: String,
            required: true
        },
        mealItems: [
            {
                name: {
                    type: String,
                    required: true
                },
                calories: {
                    type: Number,
                    required: true
                },
                protein: {
                    type: Number,
                    required: true
                },
                carbs: {
                    type: Number,
                    required: true
                },
                fats: {
                    type: Number,
                    required: true
                }
            }
        ]
    }]


}, {
    timestamps: true
})
dietPlanSchema.index({ client: 1, createdAt: -1 })
export default mongoose.model("DietPlan", dietPlanSchema);