import express from "express";
import { verifyAccessToken } from "../middleware/verifyAccessToken.js";
import { getUserProfile, getUserPosts } from "../controllers/userController.js";

const router = express.Router();

router.get("/profile/:username", verifyAccessToken, getUserProfile);
router.get("/users/:userId/posts", verifyAccessToken, getUserPosts);

export default router;
