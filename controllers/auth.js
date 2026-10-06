import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/User.js";
import bcryptjs from "bcryptjs";
import sendTokenResponse from "../utils/SendTokenResponse.js";
// @desc register user
// @route POST /api/v1/auth/register
//@access public
export const register = asyncHandler(async (req, res) => {
    const { userName, email, password, phoneNumber } = req.body;
    const existUser = await User.findOne({ email });
    if (existUser) {
        return res.status(409).json({
            success: false,
            message: "The email  already exists"
        });
    }
    const user = await User.create({
        userName,
        email,
        password,
        phoneNumber
    });
    sendTokenResponse(user, 201, res);
}
)
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    // select password beacause it is in the user model with  {select : false }
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Invalid credentials"
        });
    }
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(401).json({
            success: false,
            message: "Invalid credentials"
        });
    }
    sendTokenResponse(user, 200, res);

})
// @desc logout user
// @route GET /api/v1/auth/logout
// @access private
export const logout = asyncHandler(async (req, res) => {
    res.cookie("token", "none", {
        expires: new Date(Date.now() + 10 * 1000), // expires in 10 seconds
        httpOnly: true
    });
    res.status(200).json({
        success: true,
        message: "Logged out successfully"
    });
});

