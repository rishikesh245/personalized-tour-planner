import express from "express";
import {
  registerUser,
  loginUser,
  getProfile
} from "../controllers/authController.js"; // ✅ .js REQUIRED

import authMiddleware from "../middleware/authMiddleware.js"; // ✅ .js REQUIRED

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", authMiddleware, getProfile);

export default router;
