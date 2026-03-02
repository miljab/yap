import type { Request, Response } from "express";
import AppError from "../utils/appError.js";
import commentService from "../services/commentService.js";
import {
  ALLOWED_IMAGE_MIME,
  MAX_IMAGES,
  MAX_TEXT_LEN,
} from "../utils/constants.js";
import { validateImageMagicBytes } from "../utils/fileFilter.js";
import { handleError } from "../utils/errorUtils.js";

export const replyToPost = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const postId = req.params.id;
  const images =
    (Array.isArray(req.files) ? (req.files as Express.Multer.File[]) : []) ??
    [];
  const text = typeof req.body.text === "string" ? req.body.text.trim() : "";

  try {
    if (!userId) throw new AppError("User ID is required", 401);

    if (!postId) throw new AppError("Post ID is required", 400);

    if (!text && images.length === 0) {
      throw new AppError("Text or images are required", 400);
    }
    if (text.length > MAX_TEXT_LEN)
      throw new AppError("Max 200 characters allowed", 400);
    if (images.length > MAX_IMAGES)
      throw new AppError(`Max ${MAX_IMAGES} images allowed`, 400);

    for (const f of images) {
      if (!ALLOWED_IMAGE_MIME.test(f.mimetype)) {
        throw new AppError(
          "Only image files (png,jpg,jpeg,webp,gif) are allowed",
          400,
        );
      }
      const isValidImage = await validateImageMagicBytes(f);
      if (!isValidImage) {
        throw new AppError(
          "Invalid image file content",
          400,
        );
      }
    }

    const comment = await commentService.replyToPost(
      userId,
      postId,
      text,
      images,
    );

    return res.status(201).json(comment);
  } catch (error) {
    console.error(error);
    const { message, statusCode } = handleError(error);

    return res.status(statusCode).json({
      error: message,
    });
  }
};

export const replyToComment = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const commentId = req.params.id;
  const images =
    (Array.isArray(req.files) ? (req.files as Express.Multer.File[]) : []) ??
    [];
  const text = typeof req.body.text === "string" ? req.body.text.trim() : "";

  try {
    if (!userId) throw new AppError("User ID is required", 401);

    if (!commentId) throw new AppError("Comment ID is required", 400);

    if (!text && images.length === 0) {
      throw new AppError("Text or images are required", 400);
    }
    if (text.length > MAX_TEXT_LEN)
      throw new AppError("Max 200 characters allowed", 400);
    if (images.length > MAX_IMAGES)
      throw new AppError(`Max ${MAX_IMAGES} images allowed`, 400);

    for (const f of images) {
      if (!ALLOWED_IMAGE_MIME.test(f.mimetype)) {
        throw new AppError(
          "Only image files (png,jpg,jpeg,webp,gif) are allowed",
          400,
        );
      }
      const isValidImage = await validateImageMagicBytes(f);
      if (!isValidImage) {
        throw new AppError(
          "Invalid image file content",
          400,
        );
      }
    }

    const comment = await commentService.replyToComment(
      userId,
      commentId,
      text,
      images,
    );

    return res.status(201).json(comment);
  } catch (error) {
    console.error(error);
    const { message, statusCode } = handleError(error);

    return res.status(statusCode).json({
      error: message,
    });
  }
};

export const getComments = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const postId = req.params.id;

  try {
    if (!userId) throw new AppError("User ID is required", 401);

    if (!postId) throw new AppError("Post ID is required", 400);

    const comments = await commentService.getComments(postId, userId);

    return res.status(200).json(comments);
  } catch (error) {
    console.error(error);
    const { message, statusCode } = handleError(error);

    return res.status(statusCode).json({
      error: message,
    });
  }
};

export const likeComment = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const commentId = req.params.id;

  try {
    if (!userId) throw new AppError("User ID is required", 401);

    if (!commentId) throw new AppError("Comment ID is required", 400);

    const updatedLikeCount = await commentService.likeComment(
      userId,
      commentId,
    );

    return res.status(200).json({
      likeCount: updatedLikeCount,
    });
  } catch (error) {
    console.error(error);
    const { message, statusCode } = handleError(error);

    return res.status(statusCode).json({
      error: message,
    });
  }
};

export const getThread = async (req: Request, res: Response) => {
  const commentId = req.params.id;
  const userId = req.user?.id;

  try {
    if (!userId) throw new AppError("User ID is required", 401);

    if (!commentId) throw new AppError("Comment ID is required", 400);

    const { post, comment, parentComments, replies } =
      await commentService.getThread(commentId, userId);

    return res.status(200).json({ post, comment, parentComments, replies });
  } catch (error) {
    console.error(error);
    const { message, statusCode } = handleError(error);

    return res.status(statusCode).json({
      error: message,
    });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  const commentId = req.params.id;
  const userId = req.user?.id;

  try {
    if (!userId)
      throw new AppError("You must be logged in to delete a comment", 401);

    if (!commentId) throw new AppError("Comment ID is required", 400);

    const result = await commentService.deleteComment(commentId, userId);

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    const { message, statusCode } = handleError(error);

    return res.status(statusCode).json({
      error: message,
    });
  }
};

export const getCommentLikes = async (req: Request, res: Response) => {
  const requesterId = req.user?.id;
  const commentId = req.params.id;
  const cursor = req.query.cursor as string | undefined;
  const limit = req.query.limit
    ? parseInt(req.query.limit as string)
    : undefined;

  try {
    if (!requesterId) throw new AppError("Unauthorized", 401);

    if (!commentId) throw new AppError("Comment ID is required", 400);

    const users = await commentService.getCommentLikes(
      commentId,
      requesterId,
      cursor,
      limit,
    );

    return res.status(200).json(users);
  } catch (error) {
    console.error(error);
    const { message, statusCode } = handleError(error);

    return res.status(statusCode).json({
      error: message,
    });
  }
};
