import type { Request, Response } from "express";
import { postService } from "../services/postService.js";

export const createNewPost = async (req: Request, res: Response) => {
  const { text } = req.body;
  const images = req.files as Express.Multer.File[];
  const userId = req.user?.id;

  try {
    if (!userId) throw new Error("User ID is required");

    if (!text && images.length === 0)
      throw new Error("Text or images are required");

    if (text.length > 200) throw new Error("Max 200 characters allowed");
    if (images.length > 4) throw new Error("Max 4 images allowed");

    const post = await postService.createPost({
      userId,
      text,
      images,
    });
  } catch (error) {
    console.error(error);
  }
};
