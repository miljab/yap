import { prisma } from "../prisma/prismaClient.js";
import AppError from "../utils/appError.js";
import { deleteImages, uploadImages } from "../utils/cloudinaryHelper.js";

const DEFAULT_PAGE_LIMIT = 10;

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
        user: true,
      },
    });

    return {
      ...post,
      isLiked: false,
      likeCount: 0,
      commentCount: 0,
      likes: [],
      history: [],
    };
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
      include: {
        images: true,
      },
    });

    if (!post) throw new AppError("Post not found", 404);

    if (post.userId !== userId)
      throw new AppError("You are not authorized to delete this post", 403);

    if (!newContent && post.images.length === 0)
      throw new AppError("Text or images are required");

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

  getHomeFeed: async (
    userId: string,
    cursor?: string,
    limit: number = DEFAULT_PAGE_LIMIT,
  ) => {
    const posts = await prisma.post.findMany({
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      orderBy: { createdAt: "desc" },
      include: {
        images: true,
        user: true,
        history: true,
        likes: {
          include: {
            user: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    const hasMore = posts.length > limit;
    const result = hasMore ? posts.slice(0, -1) : posts;

    const formattedPosts = result.map((post) => {
      const isLiked = post.likes.some((like) => like.userId === userId);
      const likeCount = post.likes.length;
      const commentCount = post._count.comments;

      return {
        ...post,
        isLiked,
        likeCount,
        commentCount,
        likes: userId === post.userId ? post.likes : [],
      };
    });

    return {
      posts: formattedPosts,
      nextCursor: hasMore ? result[result.length - 1]?.id : null,
    };
  },

  getFollowingFeed: async (
    userId: string,
    cursor?: string,
    limit: number = DEFAULT_PAGE_LIMIT,
  ) => {
    const posts = await prisma.post.findMany({
      where: {
        user: {
          followers: {
            some: {
              id: userId,
            },
          },
        },
      },
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      orderBy: { createdAt: "desc" },
      include: {
        images: true,
        user: true,
        history: true,
        likes: {
          include: {
            user: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    const hasMore = posts.length > limit;
    const result = hasMore ? posts.slice(0, -1) : posts;

    const formattedPosts = result.map((post) => {
      const isLiked = post.likes.some((like) => like.userId === userId);
      const likeCount = post.likes.length;
      const commentCount = post._count.comments;

      return {
        ...post,
        isLiked,
        likeCount,
        commentCount,
        likes: userId === post.userId ? post.likes : [],
      };
    });

    return {
      posts: formattedPosts,
      nextCursor: hasMore ? result[result.length - 1]?.id : null,
    };
  },
};
