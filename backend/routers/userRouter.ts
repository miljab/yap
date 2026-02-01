import express from "express";
import { verifyAccessToken } from "../middleware/verifyAccessToken.js";
import { getUserProfile } from "../controllers/userController.js";

const router = express.Router();

router.get("/profile/:username", verifyAccessToken, getUserProfile);

export default router;
