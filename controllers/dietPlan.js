import DietPlan from "../models/DietPlan.js";
import asyncHandler from "../utils/asyncHandler.js";
import { notifyUser } from "../utils/notifyUser.js";
import { getPagination } from "../utils/pagination.js";



// @desc    Create a new diet plan
// @route   POST /api/v1/diet-plans
// @access  Private
export const createDietPlan = asyncHandler(async (req, res, next) => {
    const { client, description, totalCalories, macros, meals } = req.body;
    const dietPlan = await DietPlan.create({ client, description, totalCalories, macros, meals });
    await notifyUser({
        userId: client,
        title: "Diet Plan Created",
        message: "Your nutrition plan has been created by your coach.",
        type: "diet",
        link: "/profile"
    });
    res.status(201).json({ success: true, data: dietPlan });
});

// @desc    Get all diet plans
// @route   GET /api/v1/diet-plans
// @access  Private
export const getDietPlans = asyncHandler(async (req, res, next) => {
    const { page, limit, skip } = getPagination(req.query);
    const [dietPlans, total] = await Promise.all([
        DietPlan.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("client", "userName email")
            .lean(),
        DietPlan.countDocuments(),
    ]);

    res.status(200).json({ success: true, count: dietPlans.length, total, data: dietPlans });
});

// @desc    Get single diet plan
// @route   GET /api/v1/diet-plans/:id
// @access  Private
export const getDietPlan = asyncHandler(async (req, res, next) => {
    const dietPlan = await DietPlan.findById(req.params.id).populate("client", "userName email");
    if (!dietPlan) {
        res.status(404).json({ success: false, message: "Diet plan not found" });
    }
    res.status(200).json({ success: true, data: dietPlan });
});

// @desc    Update diet plan
// @route   PUT /api/v1/diet-plans/:id
// @access  Private
export const updateDietPlan = asyncHandler(async (req, res, next) => {
    const dietPlan = await DietPlan.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!dietPlan) {
        res.status(404).json({ success: false, message: "Diet plan not found" });
    }
    await notifyUser({
        userId: dietPlan.client,
        title: "Diet Plan Updated",
        message: "Your nutrition plan has been updated by your coach.",
        type: "diet",
        link: "/profile"
    });
    res.status(200).json({ success: true, data: dietPlan });
});

// @desc    Delete diet plan
// @route   DELETE /api/v1/diet-plans/:id
// @access  Private
export const deleteDietPlan = asyncHandler(async (req, res, next) => {
    const dietPlan = await DietPlan.findByIdAndDelete(req.params.id);
    if (!dietPlan) {
        res.status(404).json({ success: false, message: "Diet plan not found" });
    }
    res.status(200).json({ success: true, data: {} });
});

// @desc    Get diet plan for current user
// @route   GET /api/v1/diet-plans/my-diet-plan
// @access  Private
export const getMyDietPlan = asyncHandler(async (req, res, next) => {
    const dietPlan = await DietPlan.findOne({ client: req.user.id }).populate("client", "userName email");
    if (!dietPlan) {
        res.status(404).json({ success: false, message: "Diet plan not found" });
    }
    res.status(200).json({ success: true, data: dietPlan });
});