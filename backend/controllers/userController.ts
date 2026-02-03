import type { Request, Response } from "express";
import AppError from "../utils/appError.js";
import { userService } from "../services/userService.js";
import { handleError } from "../utils/errorUtils.js";

export const getUserProfile = async (req: Request, res: Response) => {
  const username = req.params.username;

  try {
    if (!username) throw new AppError("Username is required", 400);

    const user = await userService.getUserProfile(username);

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    const { message, statusCode } = handleError(error);

    return res.status(statusCode).json({
      error: message,
    });
  }
};

export const getUserPosts = async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const requesterId = req.user?.id;
  const cursor = req.query.cursor as string | undefined;
  const limit = req.query.limit
    ? parseInt(req.query.limit as string)
    : undefined;

  try {
    if (!userId) throw new AppError("User ID is required", 400);

    if (!requesterId) throw new AppError("Unauthorized", 401);

    const result = await userService.getUserPosts(
      userId,
      requesterId,
      cursor,
      limit,
    );

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    const { message, statusCode } = handleError(error);

    return res.status(statusCode).json({
      error: message,
    });
  }
};

export const getUserComments = async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const requesterId = req.user?.id;
  const cursor = req.query.cursor as string | undefined;
  const limit = req.query.limit
    ? parseInt(req.query.limit as string)
    : undefined;

  try {
    if (!userId) throw new AppError("User ID is required", 400);

    if (!requesterId) throw new AppError("Unauthorized", 401);

    const result = await userService.getUserComments(
      userId,
      requesterId,
      cursor,
      limit,
    );

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    const { message, statusCode } = handleError(error);

    return res.status(statusCode).json({
      error: message,
    });
  }
};
