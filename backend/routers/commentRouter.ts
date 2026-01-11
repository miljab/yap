import express from "express";
import multer from "multer";
import { verifyAccessToken } from "../middleware/verifyAccessToken.js";
import {
  replyToPost,
  getComments,
  likeComment,
} from "../controllers/commentController.js";

const router = express.Router();
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post(
  "/post/:id/reply",
  verifyAccessToken,
  upload.array("images", 4),
  replyToPost
);

router.get("/post/:id/comments", verifyAccessToken, getComments);

router.post("/comment/:id/like", verifyAccessToken, likeComment);

export default router;
