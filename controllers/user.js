import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/User.js";
import { getPagination } from "../utils/pagination.js";
// @desc get all users
// @route GET /api/v1/users
// @access private
export const getUsers = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);

    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    const [users, total] = await Promise.all([
        User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        User.countDocuments(filter)
    ]);
    res.status(200).json({
        success: true,
        data: users,
        total
    });
})
// desc getuser 
// @route GET /api/v1/users/:id
// @access private
export const getUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).lean();
    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found"
        });
    }
    res.status(200).json({
        success: true,
        data: user
    });

})
// desc  delete user 
// @route DELETE /api/v1/users/:id
// @access private
export const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found"
        });
    }
    res.status(200).json({
        success: true,
        message: "User deleted successfully"
    });

})
