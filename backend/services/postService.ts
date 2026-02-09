import { prisma } from "../prisma/prismaClient.js";
import AppError from "../utils/appError.js";
import { deleteImages, uploadImages } from "../utils/cloudinaryHelper.js";

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
    const imagesData = await uploadImages(images, "post-images");

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
  },

  getPostById: async (postId: string, userId: string) => {
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        images: true,
        user: true,
        likes: {
          include: {
            user: true,
          },
        },
        history: true,
      },
    });

    if (!post) throw new AppError("Post not found", 404);

    const isLiked = post.likes.some((like) => like.userId === userId);
    const likeCount = post.likes.length;

    const commentCount = await prisma.comment.count({
      where: {
        postId,
        parentId: null,
      },
    });

    if (userId !== post.user.id) {
      return { ...post, isLiked, likeCount, commentCount, likes: [] };
    }

    return { ...post, isLiked, likeCount, commentCount };
  },

  likePost: async (postId: string, userId: string) => {
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
  },

  deletePost: async (postId: string, userId: string) => {
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post) throw new AppError("Post not found", 404);

    if (post.userId !== userId)
      throw new AppError("You are not authorized to delete this post", 403);

    const images = await prisma.image.findMany({
      where: {
        postId: postId,
      },
    });

    if (images.length > 0) {
      const deletionResult = await deleteImages(images);
      console.log(deletionResult);
    }

    await prisma.post.delete({
      where: {
        id: postId,
      },
    });

    return { message: "Post deleted successfully" };
  },

  updatePost: async (postId: string, userId: string, newContent: string) => {
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post) throw new AppError("Post not found", 404);

    if (post.userId !== userId)
      throw new AppError("You are not authorized to delete this post", 403);

    await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        content: newContent,
      },
    });

    await prisma.postHistory.create({
      data: {
        postId: postId,
        content: post.content,
      },
    });

    const updatedPost = await postService.getPostById(postId, userId);

    return updatedPost;
  },
};
