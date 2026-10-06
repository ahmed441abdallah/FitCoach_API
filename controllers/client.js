import Client from "../models/Client.js";
import asyncHandler from "../utils/asyncHandler.js";
import { getPagination } from "../utils/pagination.js";
import { pick } from "../utils/pick.js";
const CLIENT_FIELDS = [
    "goals", "height", "currentWeight", "targetWeight", "trainingDaysPerWeek",
    "age", "experienceLevel", "injuriesOrRestrictions", "foodPreferences", "images",
];

const ADMIN_FIELDS = ["subscriptionPlan"];
// @desc complete onboarding
// @route POST /api/v1/client
// @access private
export const completeOnboarding = asyncHandler(async (req, res) => {
    const { goals, height, currentWeight, targetWeight, trainingDaysPerWeek, age, experienceLevel, injuriesOrRestrictions, foodPreferences, images } = req.body;
    const existingClient = await Client.findOne({ user: req.user._id });
    if (existingClient) {
        return res.status(409).json({
            success: false,
            message: "Onboarding already completed"
        });
    }
    const client = await Client.create({
        user: req.user._id,
        goals,
        height,
        currentWeight,
        targetWeight,
        trainingDaysPerWeek,
        age,
        experienceLevel,
        injuriesOrRestrictions,
        foodPreferences,
        images,
    });
    res.status(201).json({
        success: true,
        data: client
    });
});
// @desc get all clients
// @route GET /api/v1/clients
// @access private
export const getClients = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);
    const [clients, total] = await Promise.all([
        Client.find().skip(skip).limit(limit).populate("user", "_id email phoneNumber").populate("subscriptionPlan", "_id name price").sort({ createdAt: -1 }),
        Client.countDocuments()
    ]);
    res.status(200).json({
        success: true,
        data: clients,
        total
    });
});

// @desc update client
// @route PUT /api/v1/clients/:id
// @access private
export const updateClient = asyncHandler(async (req, res) => {


    const client = await Client.findById(req.params.id);

    if (!client) {
        return res.status(404).json({ success: false, message: "Client not found" });
    }

    const isOwner = client.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
        return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const allowedFields = isAdmin
        ? [...CLIENT_FIELDS, ...ADMIN_FIELDS]
        : CLIENT_FIELDS;

    client.set(pick(req.body, allowedFields));
    await client.save();

    res.status(200).json({ success: true, data: client });
});
// @desc delete client
// @route DELETE /api/v1/clients/:id
// @access private
export const deleteClient = asyncHandler(async (req, res) => {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) {
        return res.status(404).json({
            success: false,
            message: "Client not found"
        });
    }
    res.status(200).json({
        success: true,
        data: client
    });
});
// @desc get single client
// @route GET /api/v1/clients/:id
// @access private
export const getClient = asyncHandler(async (req, res) => {
    const client = await Client.findById(req.params.id).populate("user", "_id email phoneNumber").populate("subscriptionPlan", "_id name price");
    if (!client) {
        return res.status(404).json({
            success: false,
            message: "Client not found"
        });
    }
    res.status(200).json({
        success: true,
        data: client
    });
});
//@desc get my client
//@route GET /api/v1/clients/me
//@access private
export const getMyClient = asyncHandler(async (req, res) => {
    const client = await Client.findOne({ user: req.user._id }).populate("user", "_id email phoneNumber").populate("subscriptionPlan", "_id name price");
    if (!client) {
        return res.status(404).json({
            success: false,
            message: "Client not found"
        });
    }
    res.status(200).json({
        success: true,
        data: client
    });
}); 