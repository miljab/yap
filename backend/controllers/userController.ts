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
