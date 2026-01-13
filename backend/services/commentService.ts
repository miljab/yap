import { prisma } from "../prisma/prismaClient.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs/promises";
import { nanoid } from "nanoid";
import AppError from "../utils/appError.js";

const commentService = {
  replyToPost: async (
    userId: string,
    postId: string,
    text: string,
    images: Express.Multer.File[]
  ) => {
    try {
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
        },
      });

      return comment;
    } catch (error) {
      throw error;
    }
  },

  getComments: async (postId: string, userId?: string) => {
    try {
      const comments = await prisma.comment.findMany({
        where: {
          postId,
        },
        include: {
          images: true,
          user: true,
        },
      });

      const commentsWithMeta = await Promise.all(
        comments.map(async (comment) => {
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
        })
      );

      return commentsWithMeta;
    } catch (error) {
      throw error;
    }
  },

  likeComment: async (userId: string, commentId: string) => {
    try {
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
    } catch (error) {
      throw error;
    }
  },
};

export default commentService;
