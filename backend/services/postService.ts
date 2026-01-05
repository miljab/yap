import cloudinary from "../config/cloudinary.js";
import { nanoid } from "nanoid";
import { prisma } from "../prisma/prismaClient.js";
import fs from "fs/promises";
import AppError from "../utils/appError.js";

export const postService = {
  createPost: async ({
    userId,
    text,
    images,
  }: {
    userId: string;
    text: string;
    images: Express.Multer.File[];
  }) => {
    try {
      let imageUrls = [];

      for (const image of images) {
        const result = await cloudinary.uploader.upload(image.path, {
          folder: "post-images",
          public_id: nanoid(),
        });
        imageUrls.push(result.secure_url);

        await fs.unlink(image.path);
      }

      const imagesData = imageUrls.map((url, idx) => ({
        url,
        orderIndex: idx,
      }));

      const post = await prisma.post.create({
        data: {
          content: text,
          userId,
          images: {
            create: imagesData,
          },
        },
        include: {
          images: true,
        },
      });

      return post;
    } catch (error) {
      throw error;
    }
  },

  getPostById: async (postId: string) => {
    try {
      const post = await prisma.post.findUnique({
        where: {
          id: postId,
        },
        include: {
          images: true,
        },
      });

      if (!post) throw new AppError("Post not found", 404);

      return post;
    } catch (error) {
      throw error;
    }
  },
};
