import type { Request, Response } from "express";
import { sseManager } from "../services/sseManager.js";
import AppError from "../utils/appError.js";
import { notificationService } from "../services/notificationService.js";
import { handleError } from "../utils/errorUtils.js";

export const streamNotifications = (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const userId = req.user!.id;

  sseManager.addConnection(userId, res);

  res.write(": connected\n\n");

  const keepAlive = setInterval(() => {
    res.write(": keep-alive\n\n");
  }, 30000);

  req.on("close", () => {
    clearInterval(keepAlive);
    sseManager.removeConnection(userId, res);
  });
};

export const getNotifications = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const cursor = req.query.cursor as string | undefined;
  const limit = req.query.limit
    ? parseInt(req.query.limit as string)
    : undefined;

  try {
    if (!userId) throw new AppError("Unauthorized", 401);

    const notifications = await notificationService.getNotifications(
      userId,
      cursor,
      limit,
    );

    return res.status(200).json(notifications);
  } catch (error) {
    console.error(error);
    const { message, statusCode } = handleError(error);

    return res.status(statusCode).json({
      error: message,
    });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const notificationId = req.params.id;

  try {
    if (!userId) throw new AppError("Unauthorized", 401);

    if (!notificationId) throw new AppError("Notification ID is required", 400);

    await notificationService.markAsRead(userId, notificationId);

    return res.status(200);
  } catch (error) {
    console.error(error);
    const { message, statusCode } = handleError(error);

    return res.status(statusCode).json({
      error: message,
    });
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  try {
    if (!userId) throw new AppError("Unauthorized", 401);

    await notificationService.markAllAsRead(userId);

    return res.status(200);
  } catch (error) {
    console.error(error);
    const { message, statusCode } = handleError(error);

    return res.status(statusCode).json({
      error: message,
    });
  }
};

export const getUnreadCount = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  try {
    if (!userId) throw new AppError("Unauthorized", 401);

    const count = await notificationService.getUnreadCount(userId);

    return res.status(200).json(count);
  } catch (error) {
    console.error(error);
    const { message, statusCode } = handleError(error);

    return res.status(statusCode).json({
      error: message,
    });
  }
};
