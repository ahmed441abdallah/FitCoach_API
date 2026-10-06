import express from "express";
import { addProgress, getMyProgress, delteprogress, getClientProgress } from "../controllers/progressEntry.js";
import { protect } from "../middlewares/auth.js";
import { uploadSingleImage, uploadImageToCloudinary } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// GET  /api/v1/progress/me          — must come BEFORE /:id to avoid param collision
router.get("/me", protect, getMyProgress);

// GET  /api/v1/progress/:clientId   — admin views a client's progress
router.get("/:clientId", protect, getClientProgress);

// POST /api/v1/progress             — log new entry with single photo upload
router.post(
    "/",
    protect,
    uploadSingleImage("photo"),
    uploadImageToCloudinary("photo", "progress"),
    addProgress
);

// DELETE /api/v1/progress/:id
router.delete("/:id", protect, delteprogress);

export default router;