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

  getPostById: async (postId: string, userId: string | undefined) => {
    try {
      const post = await prisma.post.findUnique({
        where: {
          id: postId,
        },
        include: {
          images: true,
          user: true,
          likes: true,
        },
      });

      if (!post) throw new AppError("Post not found", 404);

      const isLiked = post.likes.some((like) => like.userId === userId);
      const likeCount = post.likes.length;

      const commentCount = await prisma.comment.count({
        where: {
          postId,
        },
      });

      if (userId !== post.user.id) {
        return { ...post, isLiked, likeCount, commentCount, likes: [] };
      }

      return { ...post, isLiked, likeCount, commentCount };
    } catch (error) {
      throw error;
    }
  },

  likePost: async (postId: string, userId: string | undefined) => {
    try {
      if (!userId) throw new AppError("User ID is required", 400);

      const post = await prisma.post.findUnique({
        where: {
          id: postId,
        },
      });

      if (!post) throw new AppError("Post not found", 404);

      const like = await prisma.postLike.findUnique({
        where: {
          userId_postId: {
            postId,
            userId,
          },
        },
      });

      if (like) {
        await prisma.postLike.delete({
          where: {
            userId_postId: {
              postId,
              userId,
            },
          },
        });
      } else {
        await prisma.postLike.create({
          data: {
            postId,
            userId,
          },
        });
      }

      const likeCount = await prisma.postLike.count({
        where: {
          postId,
        },
      });

      return likeCount;
    } catch (error) {
      throw error;
    }
  },
};
