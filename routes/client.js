import express from "express";
import { completeOnboarding, getClients, updateClient, getMyClient, deleteClient, getClient } from "../controllers/client.js";
import { authorize, protect } from "../middlewares/auth.js";
import { uploadMultiImages, uploadMultiImagesToCloudinary } from "../middlewares/uploadMiddleware.js";
const router = express.Router();

router.route("/").post(
    protect,
    uploadMultiImages("dummy", "images"),
    uploadMultiImagesToCloudinary("dummy", "images", "clients"),
    completeOnboarding
).get(protect, authorize("admin"), getClients);
router.route("/me").get(protect, getMyClient);
router.route("/:id").put(protect, updateClient).delete(protect, authorize("admin"), deleteClient).get(protect, authorize("admin"), getClient);

export default router;