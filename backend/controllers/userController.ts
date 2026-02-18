import type { Request, Response } from "express";
import AppError from "../utils/appError.js";
import { userService } from "../services/userService.js";
import { handleError } from "../utils/errorUtils.js";

export const getUserProfile = async (req: Request, res: Response) => {
  const username = req.params.username;
  const requesterId = req.user?.id;

  try {
    if (!username) throw new AppError("Username is required", 400);

    const user = await userService.getUserProfile(username, requesterId);

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

export const updateProfile = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const bio = typeof req.body.bio === "string" ? req.body.bio.trim() : "";
  const avatarFile = req.file;

  try {
    if (!userId) throw new AppError("Unauthorized", 401);

    const updatedUser = await userService.updateProfile(
      userId,
      bio,
      avatarFile,
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error);
    const { message, statusCode } = handleError(error);

    return res.status(statusCode).json({
      error: message,
    });
  }
};

export const followProfile = async (req: Request, res: Response) => {
  const requesterId = req.user?.id;
  const userId = req.params.userId;

  try {
    if (!requesterId) throw new AppError("Unauthorized", 401);

    if (!userId) throw new AppError("User ID is required", 400);

    const isFollowed = await userService.followProfile(requesterId, userId);

    res.status(200).json(isFollowed);
  } catch (error) {
    console.error(error);
    const { message, statusCode } = handleError(error);

    return res.status(statusCode).json({
      error: message,
    });
  }
};

export const getFollowingUsers = async (req: Request, res: Response) => {
  const requesterId = req.user?.id;
  const userId = req.params.userId;
  const cursor = req.query.cursor as string | undefined;
  const limit = req.query.limit
    ? parseInt(req.query.limit as string)
    : undefined;

  try {
    if (!requesterId) throw new AppError("Unauthorized", 401);

    if (!userId) throw new AppError("User ID is required", 400);

    const followingUsers = await userService.getFollowingUsers(
      requesterId,
      userId,
      cursor,
      limit,
    );

    res.status(200).json(followingUsers);
  } catch (error) {
    console.error(error);
    const { message, statusCode } = handleError(error);

    return res.status(statusCode).json({
      error: message,
    });
  }
};

export const getFollowers = async (req: Request, res: Response) => {
  const requesterId = req.user?.id;
  const userId = req.params.userId;
  const cursor = req.query.cursor as string | undefined;
  const limit = req.query.limit
    ? parseInt(req.query.limit as string)
    : undefined;

  try {
    if (!requesterId) throw new AppError("Unauthorized", 401);

    if (!userId) throw new AppError("User ID is required", 400);

    const followers = await userService.getFollowers(
      requesterId,
      userId,
      cursor,
      limit,
    );

    res.status(200).json(followers);
  } catch (error) {
    console.error(error);
    const { message, statusCode } = handleError(error);

    return res.status(statusCode).json({
      error: message,
    });
  }
};
