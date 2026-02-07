import express from "express";
import multer from "multer";
import {
  createNewPost,
  getPostById,
  likePost,
  deletePost,
  updatePost,
} from "../controllers/postController.js";
import { verifyAccessToken } from "../middleware/verifyAccessToken.js";
import { MAX_IMAGE_SIZE_BYTES, MAX_IMAGES } from "../utils/constants.js";
import { writeLimiter } from "../middleware/rateLimiter.js";

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
  createNewPost,
);

router.get("/post/:id", verifyAccessToken, getPostById);

router.post("/post/:id/like", verifyAccessToken, likePost);

router.delete("/post/:id", verifyAccessToken, deletePost);

router.put("/post/:id", verifyAccessToken, updatePost);

export default router;
