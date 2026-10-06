import express from "express"
import { getUsers, getUser, deleteUser } from "../controllers/user.js";
import { protect, authorize } from "../middlewares/auth.js";
const router = express.Router();

// Admin-only routes
router.route("/:id").get(protect, authorize("admin"), getUser).delete(protect, authorize("admin"), deleteUser);
router.route("/").get(protect, authorize("admin"), getUsers);

export default router;