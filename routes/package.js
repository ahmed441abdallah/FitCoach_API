import express from "express";
import { createPackage, deletePackage, getPackages, updatePackage, getSinglePackage } from "../controllers/package.js";
import { protect, authorize } from "../middlewares/auth.js";
const router = express.Router();

router.route("/").get(getPackages).post(protect, authorize("admin"), createPackage);
router.route("/:id").delete(protect, authorize("admin"), deletePackage).put(protect, authorize("admin"), updatePackage).get(protect, getSinglePackage);

export default router;
