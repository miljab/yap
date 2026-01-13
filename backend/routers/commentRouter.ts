import express from "express";
import multer from "multer";
import { verifyAccessToken } from "../middleware/verifyAccessToken.js";
import {
  replyToPost,
  getComments,
  likeComment,
} from "../controllers/commentController.js";
import { MAX_IMAGE_SIZE_BYTES, MAX_IMAGES } from "../utils/constants.js";

const router = express.Router();
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: MAX_IMAGE_SIZE_BYTES },
});

router.post(
  "/post/:id/reply",
  verifyAccessToken,
  upload.array("images", MAX_IMAGES),
  replyToPost
);

router.get("/post/:id/comments", verifyAccessToken, getComments);

router.post("/comment/:id/like", verifyAccessToken, likeComment);

export default router;
