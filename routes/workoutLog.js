import express from "express";
import {
    logWorkout,
    getMyWorkoutLogs,
    getClientLogs,
    getStats,
} from "../controllers/workoutLog.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

router.get("/me/stats", protect, getStats);
router.get("/me", protect, getMyWorkoutLogs);
router.post("/", protect, logWorkout);
router.get("/:clientId", protect, getClientLogs);

export default router;
