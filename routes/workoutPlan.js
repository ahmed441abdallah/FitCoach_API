import express from "express";
import { createWorkoutPlan, deleteWorkoutPlan, updateWorkoutPlan, getClientWorkoutPlan, getAllWorkoutPlans, getWorkoutPlanById, downloadWorkoutPlanPDF } from "../controllers/workoutPlan.js";
import { protect, authorize } from "../middlewares/auth.js";
const router = express.Router();

router.route("/").post(protect, authorize("admin"), createWorkoutPlan).get(protect, authorize("admin"), getAllWorkoutPlans);
router.route("/me").get(protect, authorize("client", "admin"), getClientWorkoutPlan);
router.route("/:id").get(protect, authorize("admin"), getWorkoutPlanById).delete(protect, authorize("admin"), deleteWorkoutPlan).put(protect, authorize("admin"), updateWorkoutPlan);
router.route('/:id/pdf').get(protect, downloadWorkoutPlanPDF)

export default router;
