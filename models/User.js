import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
export const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: [true, "Please enter your user name"],
        maxLenth: [25, "user name must be less then 25 character"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            'Please add a valid email'
        ]
    },
    phoneNumber: {
        type: String,
        trim: true
    },
    password: {
        type: String,
        required: [true, "Please enter your password"],
        minLength: [6, "password must be greater then 6 charcter"],
        select: false
    },
    role: {
        type: String,
        enum: ["client", "admin"],
        default: "client",
    },
}, { timestamps: true });
userSchema.pre("save", async function () {
    const salt = await bcryptjs.genSalt(12);
    this.password = await bcryptjs.hash(this.password, salt);
})
userSchema.methods.toJSON = function () {
    const userObject = this.toObject();
    delete userObject.password;
    return userObject;
};
const User = mongoose.model("User", userSchema);
export default User;