import type { Request, Response } from "express";
import AppError from "../utils/appError.js";
import commentService from "../services/commentService.js";

export const replyToPost = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const postId = req.params.id;
  const { text } = req.body;
  const images = req.files as Express.Multer.File[];

  try {
    if (!userId) throw new AppError("User ID is required", 401);

    if (!postId) throw new AppError("Post ID is required", 400);

    if (!text && !images)
      throw new AppError("Text or images are required", 400);

    if (text.length > 200) throw new AppError("Max 200 characters allowed");
    if (images.length > 4) throw new AppError("Max 4 images allowed");

    const comment = await commentService.replyToPost(
      userId,
      postId,
      text,
      images
    );

    return res.status(201).json(comment);
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: error.message,
      });
    } else {
      return res.status(500).json({
        error: "Unexpected error occurred. Please try again.",
      });
    }
  }
};

export const getComments = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const postId = req.params.id;

  try {
    if (!userId) throw new AppError("User ID is required", 401);

    if (!postId) throw new AppError("Post ID is required", 400);

    const comments = await commentService.getComments(postId);

    return res.status(200).json(comments);
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: error.message,
      });
    } else {
      return res.status(500).json({
        error: "Unexpected error occurred. Please try again.",
      });
    }
  }
};
