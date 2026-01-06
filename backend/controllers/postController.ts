import type { Request, Response } from "express";
import { postService } from "../services/postService.js";
import AppError from "../utils/appError.js";

export const createNewPost = async (req: Request, res: Response) => {
  const { text } = req.body;
  const images = req.files as Express.Multer.File[];
  const userId = req.user?.id;

  try {
    if (!userId) throw new AppError("User ID is required", 401);

    if (!text && images.length === 0)
      throw new AppError("Text or images are required");

    if (text.length > 200) throw new AppError("Max 200 characters allowed");
    if (images.length > 4) throw new AppError("Max 4 images allowed");

    const post = await postService.createPost({
      userId,
      text,
      images,
    });

    res.status(201).json(post);
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error(error);
      res
        .status(500)
        .json({ error: "An unexpected error occurred. Please try again." });
    }
  }
};

export const getPostById = async (req: Request, res: Response) => {
  const postId = req.params.id;
  const userId = req.user?.id;

  try {
    if (!postId) throw new AppError("Post ID is required", 400);

    const post = await postService.getPostById(postId, userId);
    res.status(200).json(post);
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error(error);
      res
        .status(500)
        .json({ error: "An unexpected error occurred. Please try again." });
    }
  }
};
