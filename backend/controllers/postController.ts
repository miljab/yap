import type { Request, Response } from "express";
import { postService } from "../services/postService.js";

export const createNewPost = async (req: Request, res: Response) => {
  const { text, images } = req.body;
  const userId = req.user?.id;
  try {
    if (!userId) throw new Error("User ID is required");

    const post = await postService.createPost({
      userId,
      text,
      images,
    });
  } catch (error) {
    console.error(error);
  }
};
