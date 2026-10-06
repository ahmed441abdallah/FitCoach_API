import express from "express";
import { createCupon, getCupons, getCupon, updateCupon, deleteCupon, validateCupon } from "../controllers/cupon.js";
import { protect, authorize } from "../middlewares/auth.js";

const router = express.Router();

// Validate coupon (accessible by any logged-in user)
router.post("/validate", protect, validateCupon);

// Admin-only CRUD
router.route("/")
    .get(protect, authorize("admin"), getCupons)
    .post(protect, authorize("admin"), createCupon);

router.route("/:id")
    .get(protect, authorize("admin"), getCupon)
    .put(protect, authorize("admin"), updateCupon)
    .delete(protect, authorize("admin"), deleteCupon);

export default router;
