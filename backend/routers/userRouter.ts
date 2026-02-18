import express from "express";
import multer from "multer";
import { verifyAccessToken } from "../middleware/verifyAccessToken.js";
import {
  getUserProfile,
  getUserPosts,
  getUserComments,
  updateProfile,
  followProfile,
  getFollowingUsers,
  getFollowers,
} from "../controllers/userController.js";
import { MAX_IMAGE_SIZE_BYTES } from "../utils/constants.js";

const router = express.Router();

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: MAX_IMAGE_SIZE_BYTES },
});

router.get("/profile/:username", verifyAccessToken, getUserProfile);

router.put(
  "/profile",
  verifyAccessToken,
  upload.single("avatar"),
  updateProfile,
);

router.get("/users/:userId/posts", verifyAccessToken, getUserPosts);

router.get("/users/:userId/comments", verifyAccessToken, getUserComments);

router.put("/users/:userId/follow", verifyAccessToken, followProfile);

router.get("/users/:userId/following", verifyAccessToken, getFollowingUsers);

router.get("/users/:userId/followers", verifyAccessToken, getFollowers);

export default router;
