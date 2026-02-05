import { prisma } from "../prisma/prismaClient.js";
import AppError from "../utils/appError.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs/promises";
import { nanoid } from "nanoid";

const DEFAULT_PAGE_LIMIT = 10;

export const userService = {
  getUserProfile: async (username: string) => {
    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
      include: {
        followers: true,
        following: true,
      },
    });

    if (!user) throw new AppError("User not found", 404);

    return user;
  },

  getUserPosts: async (
    userId: string,
    requesterId: string,
    cursor?: string,
    limit: number = DEFAULT_PAGE_LIMIT,
  ) => {
    const posts = await prisma.post.findMany({
      where: { userId },
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      orderBy: { createdAt: "desc" },
      include: {
        images: true,
        user: true,
        likes: true,
        history: true,
        _count: {
          select: {
            comments: {
              where: { parentId: null },
            },
          },
        },
      },
    });

    const hasMore = posts.length > limit;
    const result = hasMore ? posts.slice(0, -1) : posts;

    const formattedPosts = result.map((post) => {
      const isLiked = post.likes.some((like) => like.userId === requesterId);
      const likeCount = post.likes.length;
      const commentCount = post._count.comments;

      return {
        ...post,
        isLiked,
        likeCount,
        commentCount,
        likes: userId === requesterId ? post.likes : [],
        _count: undefined,
      };
    });

    return {
      posts: formattedPosts,
      nextCursor: hasMore ? result[result.length - 1]?.id : null,
    };
  },

  getUserComments: async (
    userId: string,
    requesterId: string,
    cursor?: string,
    limit: number = DEFAULT_PAGE_LIMIT,
  ) => {
    const comments = await prisma.comment.findMany({
      where: { userId },
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      orderBy: { createdAt: "desc" },
      include: {
        images: true,
        user: true,
        likes: true,
        _count: {
          select: {
            replies: true,
          },
        },
      },
    });

    const hasMore = comments.length > limit;
    const result = hasMore ? comments.slice(0, -1) : comments;

    const formattedComments = result.map((comment) => {
      const isLiked = comment.likes.some((like) => like.userId === requesterId);
      const likeCount = comment.likes.length;
      const commentCount = comment._count.replies;

      return {
        ...comment,
        isLiked,
        likeCount,
        commentCount,
        likes: userId === requesterId ? comment.likes : [],
      };
    });

    return {
      comments: formattedComments,
      nextCursor: hasMore ? result[result.length - 1]?.id : null,
    };
  },

  updateProfile: async (
    userId: string,
    bio?: string,
    avatarFile?: Express.Multer.File,
  ) => {
    let avatarUrl: string | undefined;

    if (avatarFile) {
      const result = await cloudinary.uploader.upload(avatarFile.path, {
        folder: "avatars",
        public_id: nanoid(),
        transformation: [
          { width: 400, height: 400, crop: "fill", gravity: "face" },
        ],
      });
      avatarUrl = result.secure_url;
      await fs.unlink(avatarFile.path);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(bio !== undefined && { bio }),
        ...(avatarUrl && { avatar: avatarUrl }),
      },
      include: {
        followers: true,
        following: true,
      },
    });

    return updatedUser;
  },
};
