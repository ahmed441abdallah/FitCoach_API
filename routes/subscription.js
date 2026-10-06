import express from "express";
const router = express.Router();
import { protect, authorize } from "../middlewares/auth.js";


import { buySubscription, calculateSubscription, getSubscriptions, approveSubscription, rejectSubscription, generateInvoice, getAdminDashboardStats, getMySubscription } from "../controllers/subscriptions.js";
import { uploadSingleImage, uploadImageToCloudinary } from "../middlewares/uploadMiddleware.js";
router.get("/stats/dashboard", protect, authorize('admin'), getAdminDashboardStats);
router.get("/me", protect, authorize('client'), getMySubscription);
router.route("/calculate").post(protect, authorize('client'), calculateSubscription);
router.route("/").post(protect, authorize('client'), uploadSingleImage("paymentProof"), uploadImageToCloudinary("paymentProof", "paymentProofs"), buySubscription).get(protect, authorize('admin'), getSubscriptions);
router.route("/:id/approve").put(protect, authorize('admin'), approveSubscription);
router.route("/:id/reject").put(protect, authorize('admin'), rejectSubscription);
router.get('/:subscriptionId/invoice', protect, authorize('admin'), generateInvoice);
export default router;