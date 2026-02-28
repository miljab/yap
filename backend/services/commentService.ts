import { prisma } from "../prisma/prismaClient.js";
import AppError from "../utils/appError.js";
import { postService } from "./postService.js";
import { uploadImages } from "../utils/cloudinaryHelper.js";
import { commentPresenter } from "../presenters/commentPresenter.js";

export const baseCommentInclude = (userId: string) => {
  return {
    images: {
      select: {
        url: true,
        orderIndex: true,
      },
    },
    user: {
      include: {
        avatar: {
          select: {
            url: true,
          },
        },
      },
    },
    likes: {
      where: { userId },
      select: {
        userId: true,
      },
    },

    _count: {
      select: {
        replies: true,
        likes: true,
      },
    },
  };
};

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

    const imagesData = await uploadImages(images, "comment-images");

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
        images: {
          select: {
            url: true,
            orderIndex: true,
          },
        },
        user: {
          include: {
            avatar: {
              select: {
                url: true,
              },
            },
          },
        },
      },
    });

    return commentPresenter.new(comment);
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

    if (!parentComment) throw new AppError("Comment not found", 404);

    const imagesData = await uploadImages(images, "comment-images");

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
        images: {
          select: {
            url: true,
            orderIndex: true,
          },
        },
        user: {
          include: {
            avatar: {
              select: {
                url: true,
              },
            },
          },
        },
      },
    });

    return commentPresenter.new(comment);
  },

  getComments: async (postId: string, userId: string) => {
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post) throw new AppError("Post not found", 404);

    const comments = await prisma.comment.findMany({
      where: {
        postId,
        parentId: null,
      },
      include: baseCommentInclude(userId),
      orderBy: [
        {
          createdAt: "desc",
        },
      ],
    });

    return commentPresenter.list(comments);
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
      include: baseCommentInclude(userId),
    });

    if (!comment) throw new AppError("Comment not found", 404);

    const post = await postService.getPostById(comment.postId, userId);

    const replies = await prisma.comment.findMany({
      where: {
        parentId: comment.id,
      },
      include: baseCommentInclude(userId),
      orderBy: [
        {
          createdAt: "desc",
        },
      ],
    });

    const parentComments = [];
    let currentParentId = comment.parentId;

    while (currentParentId) {
      const parentComment = await prisma.comment.findUnique({
        where: {
          id: currentParentId,
        },
        include: baseCommentInclude(userId),
      });

      if (!parentComment) break;

      parentComments.unshift(parentComment);
      currentParentId = parentComment?.parentId;
    }

    return {
      comment: commentPresenter.single(comment),
      post,
      replies: commentPresenter.list(replies),
      parentComments: commentPresenter.list(parentComments),
    };
  },

  deleteComment: async (commentId: string, userId: string) => {
    const comment = await prisma.comment.findUnique({
      where: {
        id: commentId,
      },
    });

    if (!comment) throw new AppError("Comment not found", 404);

    if (userId !== comment.userId)
      throw new AppError("You are not authorized to delete this comment", 403);

    await prisma.comment.delete({
      where: {
        id: commentId,
      },
    });

    return { message: "Comment deleted successfully" };
  },
};

export default commentService;
