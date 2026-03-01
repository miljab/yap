import express from "express";
import multer from "multer";
import {
  createNewPost,
  getPostById,
  likePost,
  deletePost,
  updatePost,
  getHomeFeed,
  getFollowingFeed,
  getEditHistory,
} from "../controllers/postController.js";
import { verifyAccessToken } from "../middleware/verifyAccessToken.js";
import { MAX_IMAGE_SIZE_BYTES, MAX_IMAGES } from "../utils/constants.js";
import { createMulterErrorHandler } from "../middleware/handleMulterError.js";
import type { RequestHandler } from "express";

const createPostRouter = ({
  writeLimiter,
}: {
  writeLimiter: RequestHandler;
}) => {
  const router = express.Router();
  const upload = multer({
    dest: "uploads/",
    limits: { fileSize: MAX_IMAGE_SIZE_BYTES },
  });

  router.post(
    "/post/new",
    verifyAccessToken,
    writeLimiter,
    upload.array("images", MAX_IMAGES),
    createMulterErrorHandler(MAX_IMAGES),
    createNewPost,
  );

  router.get("/post/:id", verifyAccessToken, getPostById);

  router.post("/post/:id/like", verifyAccessToken, likePost);

  router.delete("/post/:id", verifyAccessToken, deletePost);

  router.put("/post/:id", verifyAccessToken, updatePost);

  router.get("/feed", verifyAccessToken, getHomeFeed);

  router.get("/feed/following", verifyAccessToken, getFollowingFeed);

  router.get("/post/:id/history", verifyAccessToken, getEditHistory);

  return router;
};

export default createPostRouter;
