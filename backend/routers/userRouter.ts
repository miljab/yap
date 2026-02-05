import express from "express";
import multer from "multer";
import { verifyAccessToken } from "../middleware/verifyAccessToken.js";
import {
  getUserProfile,
  getUserPosts,
  getUserComments,
  updateProfile,
} from "../controllers/userController.js";

const router = express.Router();

const upload = multer({
  dest: "uploads/",
});

router.get("/profile/:username", verifyAccessToken, getUserProfile);

router.put("/profile", verifyAccessToken, upload.single("avatar"), updateProfile);

router.get("/users/:userId/posts", verifyAccessToken, getUserPosts);

router.get("/users/:userId/comments", verifyAccessToken, getUserComments);

export default router;
