import asyncHandler from "../utils/asyncHandler.js";
import ProgressEntry from "../models/ProgressEntry.js";
import Client from "../models/Client.js";
// @desc add progress
// @route POST /api/v1/progress
// @access private
export const addProgress = asyncHandler(async (req, res) => {
    const { date, weight, photo, bodyFat, measurements } = req.body;

    const progressEntry = await ProgressEntry.create({
        user: req.user._id,
        date,
        weight,
        photo,
        bodyFat,
        measurements
    });
    res.status(201).json({
        success: true,
        data: progressEntry
    });
})
// @desc get my progress
// @route GET /api/v1/progress/me
// @access private
export const getMyProgress = asyncHandler(async (req, res) => {
    const progressEntries = await ProgressEntry.find({ user: req.user._id });
    res.status(200).json({
        success: true,
        data: progressEntries
    });
})
// @desc delete progress
// @route GET /api/v1/progress/:id
// @access private
export const delteprogress = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const progressEntry = await ProgressEntry.findById(id);
    if (!progressEntry) {
        return res.status(404).json({
            success: false,
            message: "Progress not found"
        });
    }
    await progressEntry.deleteOne();
    res.status(200).json({
        success: true,
        message: "Progress deleted successfully",
        data: {}
    });
})
// @desc getClientProgress
// @route GET /api/v1/progress/:clientId
// @access private
export const getClientProgress = asyncHandler(async (req, res) => {
    const { clientId } = req.params;
    const progressEntries = await ProgressEntry.find({ user: clientId });
    res.status(200).json({
        success: true,
        data: progressEntries
    });
})