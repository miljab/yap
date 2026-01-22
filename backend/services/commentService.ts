import { prisma } from "../prisma/prismaClient.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs/promises";
import { nanoid } from "nanoid";
import AppError from "../utils/appError.js";
import type { Comment } from "@prisma/client";
import { postService } from "./postService.js";

const commentService = {
  replyToPost: async (
    userId: string,
    postId: string,
    text: string,
    images: Express.Multer.File[],
  ) => {
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post) throw new AppError("Post not found", 404);

    let imageUrls = [];

    for (const image of images) {
      const result = await cloudinary.uploader.upload(image.path, {
        folder: "comment-images",
        public_id: nanoid(),
      });
      imageUrls.push(result.secure_url);

      await fs.unlink(image.path);
    }

    const imagesData = imageUrls.map((url, idx) => ({
      url,
      orderIndex: idx,
    }));

    const comment = await prisma.comment.create({
      data: {
        content: text,
        postId,
        userId,
        images: {
          create: imagesData,
        },
      },
      include: {
        images: true,
        user: true,
      },
    });

    return comment;
  },

  replyToComment: async (
    userId: string,
    commentId: string,
    text: string,
    images: Express.Multer.File[],
  ) => {
    const parentComment = await prisma.comment.findUnique({
      where: {
        id: commentId,
      },
    });

    console.log(commentId);

    if (!parentComment) throw new AppError("Comment not found", 404);

    let imageUrls = [];

    for (const image of images) {
      const result = await cloudinary.uploader.upload(image.path, {
        folder: "comment-images",
        public_id: nanoid(),
      });
      imageUrls.push(result.secure_url);

      await fs.unlink(image.path);
    }

    const imagesData = imageUrls.map((url, idx) => ({
      url,
      orderIndex: idx,
    }));

    const comment = await prisma.comment.create({
      data: {
        content: text,
        postId: parentComment.postId,
        parentId: parentComment.id,
        userId,
        images: {
          create: imagesData,
        },
      },
      include: {
        images: true,
        user: true,
      },
    });

    return comment;
  },

  getComments: async (postId: string, userId?: string) => {
    const comments = await prisma.comment.findMany({
      where: {
        postId,
        parentId: null,
      },
      include: {
        images: true,
        user: true,
      },
      orderBy: [
        {
          createdAt: "desc",
        },
      ],
    });

    const commentsWithMeta = await Promise.all(
      comments.map(async (comment) =>
        commentService.getCommentMeta(comment, userId),
      ),
    );

    return commentsWithMeta;
  },

  getCommentMeta: async (comment: Comment, userId?: string) => {
    try {
      const [likeCount, commentCount, isLiked] = await Promise.all([
        prisma.commentLike.count({
          where: { commentId: comment.id },
        }),
        prisma.comment.count({
          where: { parentId: comment.id },
        }),
        userId
          ? prisma.commentLike
              .findUnique({
                where: {
                  userId_commentId: {
                    userId,
                    commentId: comment.id,
                  },
                },
              })
              .then((like) => !!like)
          : Promise.resolve(false),
      ]);

      return {
        ...comment,
        likeCount,
        commentCount,
        isLiked,
      };
    } catch (error) {
      throw error;
    }
  },

  likeComment: async (userId: string, commentId: string) => {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) throw new AppError("Comment not found", 404);

    const like = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId,
        },
      },
    });

    if (like) {
      await prisma.commentLike.delete({
        where: {
          userId_commentId: {
            userId,
            commentId,
          },
        },
      });
    } else {
      await prisma.commentLike.create({
        data: {
          userId,
          commentId,
        },
      });
    }

    const likeCount = await prisma.commentLike.count({
      where: { commentId },
    });

    return likeCount;
  },

  getThread: async (commentId: string, userId: string) => {
    const comment = await prisma.comment.findUnique({
      where: {
        id: commentId,
      },
      include: {
        images: true,
        user: true,
      },
    });

    if (!comment) throw new AppError("Comment not found", 404);

    const commentWithMeta = await commentService.getCommentMeta(
      comment,
      userId,
    );

    const post = await postService.getPostById(comment.postId, userId);

    const replies = await prisma.comment.findMany({
      where: {
        parentId: comment.id,
      },
      include: {
        images: true,
        user: true,
      },
      orderBy: [
        {
          createdAt: "desc",
        },
      ],
    });

    const repliesWithMeta = await Promise.all(
      replies.map(async (reply) =>
        commentService.getCommentMeta(reply, userId),
      ),
    );

    const parentComments = [];
    let currentParentId = comment.parentId;

    while (currentParentId) {
      const parentComment = await prisma.comment.findUnique({
        where: {
          id: currentParentId,
        },
        include: {
          images: true,
          user: true,
        },
      });

      if (!parentComment) break;

      parentComments.unshift(parentComment);
      currentParentId = parentComment?.parentId;
    }

    const parentCommentsWithMeta = await Promise.all(
      parentComments.map((com) => commentService.getCommentMeta(com, userId)),
    );

    return {
      comment: commentWithMeta,
      post,
      replies: repliesWithMeta,
      parentComments: parentCommentsWithMeta,
    };
  },
};

export default commentService;
