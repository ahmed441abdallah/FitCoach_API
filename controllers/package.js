import Package from "../models/Package.js";
import asyncHandler from "../utils/asyncHandler.js";
// @desc get all packages
// @route GET /api/v1/package
// @access public
export const getPackages = asyncHandler(async (req, res) => {
    const packages = await Package.find().sort({ price: 1 }).lean();
    // Public data — let CDN / reverse-proxy cache it for 5 min,
    // serve stale for up to 10 min while revalidating in background.
    res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=600");
    res.status(200).json({
        success: true,
        data: packages
    });
}
)
// @desc create package
// @route POST /api/v1/package
// @access private

export const createPackage = asyncHandler(async (req, res) => {
    const _package = await Package.create(req.body);
    res.status(201).json({
        success: true,
        data: _package
    });
}
)
// @desc delete package
// @route DELETE /api/v1/package/:id
// @access private

export const deletePackage = asyncHandler(async (req, res) => {
    const _package = await Package.findById(req.params.id);
    if (!_package) {
        return res.status(404).json({ success: false, message: "Package not found" });
    }
    await Package.deleteOne({ _id: req.params.id });
    res.status(200).json({
        success: true,
        data: _package
    });
}
)

// @desc update package 
// @route PUT /api/v1/package/:id
// @access private

export const updatePackage = asyncHandler(async (req, res) => {
    const _package = await Package.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!_package) {
        return res.status(404).json({ success: false, message: "Package not found" });
    }
    res.status(200).json({
        success: true,
        data: _package
    });
}
)
// @desc get single package
// @route GET /api/v1/package/:id
// @access public
export const getSinglePackage = asyncHandler(async (req, res) => {
    const _package = await Package.findById(req.params.id).lean();
    if (!_package) {
        return res.status(404).json({ success: false, message: "Package not found" });
    }
    res.status(200).json({
        success: true,
        data: _package
    });
}
)
