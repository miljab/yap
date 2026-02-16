import type { Request, Response } from "express";
import { postService } from "../services/postService.js";
import AppError from "../utils/appError.js";
import {
  ALLOWED_IMAGE_MIME,
  MAX_IMAGES,
  MAX_TEXT_LEN,
} from "../utils/constants.js";
import { handleError } from "../utils/errorUtils.js";

export const createNewPost = async (req: Request, res: Response) => {
  const text = typeof req.body.text === "string" ? req.body.text.trim() : "";
  const images = req.files as Express.Multer.File[];
  const userId = req.user?.id;

  try {
    if (!userId) throw new AppError("User ID is required", 401);

    if (!text && images.length === 0)
      throw new AppError("Text or images are required");

    if (text.length > MAX_TEXT_LEN)
      throw new AppError("Max 200 characters allowed");
    if (images.length > MAX_IMAGES)
      throw new AppError(`Max ${MAX_IMAGES} images allowed`);

    for (const f of images) {
      if (!ALLOWED_IMAGE_MIME.test(f.mimetype)) {
        throw new AppError(
          "Only image files (png,jpg,jpeg,webp,gif) are allowed",
          400,
        );
      }
    }

    const post = await postService.createPost({
      userId,
      text,
      images,
    });

    res.status(201).json(post);
  } catch (error) {
    console.error(error);
    const { message, statusCode } = handleError(error);

    return res.status(statusCode).json({
      error: message,
    });
  }
};

export const getPostById = async (req: Request, res: Response) => {
  const postId = req.params.id;
  const userId = req.user?.id;

  try {
    if (!postId) throw new AppError("Post ID is required", 400);

    if (!userId) throw new AppError("User ID is required", 401);

    const post = await postService.getPostById(postId, userId);
    res.status(200).json(post);
  } catch (error) {
    console.error(error);
    const { message, statusCode } = handleError(error);

    return res.status(statusCode).json({
      error: message,
    });
  }
};

export const likePost = async (req: Request, res: Response) => {
  const postId = req.params.id;
  const userId = req.user?.id;

  try {
    if (!postId) throw new AppError("Post ID is required", 400);

    if (!userId) throw new AppError("User ID is required", 401);

    const updatedLikeCount = await postService.likePost(postId, userId);

    res.status(200).json({ likeCount: updatedLikeCount });
  } catch (error) {
    console.error(error);
    const { message, statusCode } = handleError(error);

    return res.status(statusCode).json({
      error: message,
    });
  }
};

export const deletePost = async (req: Request, res: Response) => {
  const postId = req.params.id;
  const userId = req.user?.id;

  try {
    if (!postId) throw new AppError("Post ID is required", 400);

    if (!userId) throw new AppError("User ID is required", 401);

    const result = await postService.deletePost(postId, userId);

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    const { message, statusCode } = handleError(error);

    return res.status(statusCode).json({
      error: message,
    });
  }
};

export const updatePost = async (req: Request, res: Response) => {
  const postId = req.params.id;
  const userId = req.user?.id;
  const newContent = req.body.content;

  try {
    if (!postId) throw new AppError("Post ID is required", 400);

    if (!userId) throw new AppError("User ID is required", 401);

    const updatedPost = await postService.updatePost(
      postId,
      userId,
      newContent,
    );

    res.status(200).json(updatedPost);
  } catch (error) {
    console.error(error);
    const { message, statusCode } = handleError(error);

    return res.status(statusCode).json({
      error: message,
    });
  }
};

export const getHomeFeed = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const cursor = req.query.cursor as string | undefined;
  const limit = req.query.limit
    ? parseInt(req.query.limit as string)
    : undefined;

  try {
    if (!userId) throw new AppError("Unauthorized", 401);

    const posts = await postService.getHomeFeed(userId, cursor, limit);

    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    const { message, statusCode } = handleError(error);

    return res.status(statusCode).json({
      error: message,
    });
  }
};
