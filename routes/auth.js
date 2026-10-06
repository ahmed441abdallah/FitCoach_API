import express from "express";
import { register, login, logout } from "../controllers/auth.js";
import { validateRequest, registerSchema, loginSchema } from "../validation/user/indesx.js";
import { authLimiter } from "../middlewares/rateLimiter.js";
const router = express.Router();
router.post("/register", authLimiter, validateRequest(registerSchema), register);
router.post("/login", authLimiter, validateRequest(loginSchema), login);
router.get("/logout", logout);
export default router;