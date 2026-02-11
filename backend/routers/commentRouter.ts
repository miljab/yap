import express from "express";
import multer from "multer";
import { verifyAccessToken } from "../middleware/verifyAccessToken.js";
import {
  replyToPost,
  getComments,
  likeComment,
  getThread,
  replyToComment,
  deleteComment,
} from "../controllers/commentController.js";
import { MAX_IMAGE_SIZE_BYTES, MAX_IMAGES } from "../utils/constants.js";
import { writeLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: MAX_IMAGE_SIZE_BYTES },
});

router.post(
  "/post/:id/reply",
  verifyAccessToken,
  writeLimiter,
  upload.array("images", MAX_IMAGES),
  replyToPost,
);

router.post(
  "/comment/:id/reply",
  verifyAccessToken,
  writeLimiter,
  upload.array("images", MAX_IMAGES),
  replyToComment,
);

router.get("/post/:id/comments", verifyAccessToken, getComments);

router.post("/comment/:id/like", verifyAccessToken, likeComment);

router.get("/comment/:id/thread", verifyAccessToken, getThread);

router.delete("/comment/:id", verifyAccessToken, deleteComment);

export default router;
