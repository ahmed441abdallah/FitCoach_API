import express from "express";
import {
    createDietPlan,
    getDietPlans,
    getDietPlan,
    updateDietPlan,
    deleteDietPlan,
    getMyDietPlan
} from "../controllers/dietPlan.js";
import { authorize, protect } from "../middlewares/auth.js";

const router = express.Router();

router.route("/").get(protect, authorize("admin"), getDietPlans).post(protect, authorize("admin"), createDietPlan);
router.route("/my-diet-plan").get(protect, getMyDietPlan);
router.route("/:id").get(protect, authorize("admin"), getDietPlan).put(protect, authorize("admin"), updateDietPlan).delete(protect, authorize("admin"), deleteDietPlan);

export default router;