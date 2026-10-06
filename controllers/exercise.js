import asyncHandler from "../utils/asyncHandler.js";
import Exercise from "../models/Exercise.js";
import { getPagination } from "../utils/pagination.js";
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getExercises = asyncHandler(async (req, res) => {
    const { search, bodyPart, target, equipment } = req.query;
    const { page, limit, skip } = getPagination(req.query, {
        defaultLimit: 30,
        maxLimit: 2000,
    });
    let query = {}
    // typeof check يمنع { $ne: ... } و arrays

    if (typeof search === "string" && search.trim()) {
        query.name = { $regex: escapeRegex(search.trim()), $options: "i" };

    }
    if (typeof bodyPart === "string") {
        query.bodyPart = bodyPart;
    }
    if (typeof target === "string") {
        query.target = target;
    }
    if (typeof equipment === "string") {
        query.equipment = equipment;
    }
    const [exercises, total] = await Promise.all([
        Exercise.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).select('-__v').lean(),
        Exercise.countDocuments(query)
    ]);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
        success: true,
        data: exercises,
        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        }

    })
})
//@desc get single exercise
//@route GET /api/v1/exercises/:id
//@access private
export const getExercise = asyncHandler(async (req, res, next) => {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
        return res.status(404).json({
            success: false,
            message: "Exercise not found"
        });
    }
    res.status(200).json({
        success: true,
        data: exercise
    })
})
//desc update exercise
//@route PUT /api/v1/exercises/:id
//@access private
export const updateExercise = asyncHandler(async (req, res, next) => {
    const exercise = await Exercise.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!exercise) {
        return res.status(404).json({
            success: false,
            message: "Exercise not found"
        });
    }
    res.status(200).json({
        success: true,
        data: exercise
    })
})
//desc delete exercise
//@route DELETE /api/v1/exercises/:id
//@access private
export const deleteExercise = asyncHandler(async (req, res, next) => {
    const exercise = await Exercise.findByIdAndDelete(req.params.id);
    if (!exercise) {
        return res.status(404).json({
            success: false,
            message: "Exercise not found"
        });
    }
    res.status(200).json({
        success: true,
        data: exercise
    })
})
//desc create exercise
//@route POST /api/v1/exercises
//@access private
export const createExercise = asyncHandler(async (req, res, next) => {
    const exercise = await Exercise.create(req.body);
    res.status(201).json({
        success: true,
        data: exercise
    })
})