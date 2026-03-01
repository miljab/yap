import { postPresenter } from "../presenters/postPresenter.js";
import { prisma } from "../prisma/prismaClient.js";
import AppError from "../utils/appError.js";
import { deleteImages, uploadImages } from "../utils/cloudinaryHelper.js";
import { paginate } from "../utils/pagination.js";

const DEFAULT_PAGE_LIMIT = 10;

export const basePostInclude = (userId: string) => {
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
    history: {
      select: {
        id: true,
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
        comments: true,
        likes: true,
      },
    },
  };
};

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

    return postPresenter.new(post);
  },

  getPostById: async (postId: string, userId: string) => {
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      include: basePostInclude(userId),
    });

    if (!post) throw new AppError("Post not found", 404);

    return postPresenter.single(post);
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
      throw new AppError("Text or images are required", 400);

    const updatedPost = await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        content: newContent,
      },
      include: basePostInclude(userId),
    });

    await prisma.postHistory.create({
      data: {
        postId: postId,
        content: post.content,
      },
    });

    return postPresenter.single(updatedPost);
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
      include: basePostInclude(userId),
    });

    const { result, nextCursor } = paginate(posts, limit);

    return postPresenter.feed(result, { nextCursor });
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
              followerId: userId,
            },
          },
        },
      },
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      orderBy: { createdAt: "desc" },
      include: basePostInclude(userId),
    });

    const { result, nextCursor } = paginate(posts, limit);

    return postPresenter.feed(result, { nextCursor });
  },

  getEditHistory: async (postId: string) => {
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        id: true,
      },
    });

    if (!post) throw new AppError("Post not found", 404);

    const postHistory = await prisma.postHistory.findMany({
      where: {
        id: postId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return postPresenter.history(postHistory);
  },
};
