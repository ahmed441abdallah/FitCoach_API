import mongoose from "mongoose";

const cuponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    discount: {
        type: Number,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    }
}, { timestamps: true });

const Cupon = mongoose.model("Cupon", cuponSchema);
export default Cupon;
