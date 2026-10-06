import mongoose from "mongoose";
const subscriptionSchema = new mongoose.Schema({
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    package: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Package",
        required: true
    },
    pricingOption: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    status: {
        type: String,
        enum: ["pending", "active", "expired", "cancelled"],
        default: "pending"
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed"],
        default: "pending"
    },
    paymentMethod: {
        type: String,
        default: "instapay"
    },
    paymentProof: {
        // an image url from cloudinary
        type: String,
        required: [true, "please enter your payment proof"]
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
    },
    couponCode: { type: String, default: null },
    originalPrice: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true },
    durationInMonths: { type: Number, required: true },

}, { timestamps: true });

subscriptionSchema.index({ client: 1, status: 1 });
const Subscription = mongoose.model("Subscription", subscriptionSchema);
export default Subscription;