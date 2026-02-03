import { prisma } from "../prisma/prismaClient.js";
import AppError from "../utils/appError.js";

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
};
