import mongoose from "mongoose";

const packageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    pricingOptions: [
        {
            durationInMonths: {
                type: Number,
                required: true
            },
            price: {
                type: Number,
                required: true
            }
        }
    ],

    description: {
        type: [String],
        required: true,
    },
}, { timestamps: true });

const Package = mongoose.model("Package", packageSchema);
export default Package;
