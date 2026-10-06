import express from "express";
import { protect } from "../middlewares/auth.js";
import { getNotifications, markAsRead, markAllAsRead } from "../controllers/notifications.js";

const router = express.Router();

router.get("/me", protect, getNotifications);
router.put("/read-all", protect, markAllAsRead);
router.put("/:id/read", protect, markAsRead);

export default router;