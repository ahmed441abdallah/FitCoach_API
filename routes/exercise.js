import express from "express";
import {
    getExercises,
    getExercise,
    updateExercise,
    deleteExercise,
    createExercise,
} from "../controllers/exercise.js";
import { protect, authorize } from "../middlewares/auth.js";
const router = express.Router();

router.route("/").get(getExercises).post(protect, authorize("admin"), createExercise);
router.route("/:id").get(getExercise).put(protect, authorize("admin"), updateExercise).delete(protect, authorize("admin"), deleteExercise);
export default router;