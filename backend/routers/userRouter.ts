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
  getMyFollowingIds,
} from "../controllers/userController.js";
import { MAX_IMAGE_SIZE_BYTES } from "../utils/constants.js";
import { imageFileFilter } from "../utils/fileFilter.js";
import { createMulterErrorHandler } from "../middleware/handleMulterError.js";

const createUserRouter = () => {
  const router = express.Router();

  const upload = multer({
    dest: "uploads/",
    limits: { fileSize: MAX_IMAGE_SIZE_BYTES },
    fileFilter: imageFileFilter,
  });

  router.get("/profile/:username", verifyAccessToken, getUserProfile);

  router.put(
    "/profile",
    verifyAccessToken,
    upload.single("avatar"),
    createMulterErrorHandler(1),
    updateProfile,
  );

  router.get("/users/:userId/posts", verifyAccessToken, getUserPosts);

  router.get("/users/:userId/comments", verifyAccessToken, getUserComments);

  router.put("/users/:userId/follow", verifyAccessToken, followProfile);

  router.get("/users/:userId/following", verifyAccessToken, getFollowingUsers);

  router.get("/users/:userId/followers", verifyAccessToken, getFollowers);

  router.get("/users/me/following-ids", verifyAccessToken, getMyFollowingIds);

  return router;
};

export default createUserRouter;
