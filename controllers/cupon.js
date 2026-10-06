import asyncHandler from "../utils/asyncHandler.js";
import Cupon from "../models/Cupon.js";

// @desc    Create a coupon
// @route   POST /api/v1/cupons
// @access  Private (admin)
export const createCupon = asyncHandler(async (req, res) => {
    const cupon = await Cupon.create(req.body);
    res.status(201).json({
        success: true,
        data: cupon
    });
});

// @desc    Get all coupons
// @route   GET /api/v1/cupons
// @access  Private (admin)
export const getCupons = asyncHandler(async (req, res) => {
    const cupons = await Cupon.find();
    res.status(200).json({
        success: true,
        count: cupons.length,
        data: cupons
    });
});

// @desc    Get single coupon
// @route   GET /api/v1/cupons/:id
// @access  Private (admin)
export const getCupon = asyncHandler(async (req, res) => {
    const cupon = await Cupon.findById(req.params.id);
    if (!cupon) {
        return res.status(404).json({
            success: false,
            message: "Coupon not found"
        });
    }
    res.status(200).json({
        success: true,
        data: cupon
    });
});

// @desc    Update coupon
// @route   PUT /api/v1/cupons/:id
// @access  Private (admin)
export const updateCupon = asyncHandler(async (req, res) => {
    const cupon = await Cupon.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!cupon) {
        return res.status(404).json({
            success: false,
            message: "Coupon not found"
        });
    }
    res.status(200).json({
        success: true,
        data: cupon
    });
});

// @desc    Delete coupon
// @route   DELETE /api/v1/cupons/:id
// @access  Private (admin)
export const deleteCupon = asyncHandler(async (req, res) => {
    const cupon = await Cupon.findByIdAndDelete(req.params.id);
    if (!cupon) {
        return res.status(404).json({
            success: false,
            message: "Coupon not found"
        });
    }
    res.status(200).json({
        success: true,
        message: "Coupon deleted successfully"
    });
});

// @desc    Validate a coupon by code (for clients to apply)
// @route   POST /api/v1/cupons/validate
// @access  Private
export const validateCupon = asyncHandler(async (req, res) => {
    const { code } = req.body;
    if (!code) {
        return res.status(400).json({
            success: false,
            message: "Please provide a coupon code"
        });
    }
    const cupon = await Cupon.findOne({ code: code.toUpperCase() });
    if (!cupon) {
        return res.status(404).json({
            success: false,
            message: "Invalid coupon code"
        });
    }
    if (cupon.expiresAt < new Date()) {
        return res.status(400).json({
            success: false,
            message: "This coupon has expired"
        });
    }
    res.status(200).json({
        success: true,
        message: "Coupon is valid",
        data: {
            code: cupon.code,
            discount: cupon.discount,
            expiresAt: cupon.expiresAt
        }
    });
});
