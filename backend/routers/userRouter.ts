import express from "express";
import { verifyAccessToken } from "../middleware/verifyAccessToken.js";
import {
  getUserProfile,
  getUserPosts,
  getUserComments,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/profile/:username", verifyAccessToken, getUserProfile);

router.get("/users/:userId/posts", verifyAccessToken, getUserPosts);

router.get("/users/:userId/comments", verifyAccessToken, getUserComments);

export default router;
