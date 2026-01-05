import express from "express";
import multer from "multer";
import { createNewPost, getPostById } from "../controllers/postController.js";
import { verifyAccessToken } from "../middleware/verifyAccessToken.js";

const router = express.Router();
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post(
  "/post/new",
  verifyAccessToken,
  upload.array("images", 4),
  createNewPost
);

router.get("/post/:id", verifyAccessToken, getPostById);

export default router;
