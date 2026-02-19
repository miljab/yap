import { prisma } from "../prisma/prismaClient.js";
import AppError from "../utils/appError.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs/promises";
import { nanoid } from "nanoid";

const DEFAULT_PAGE_LIMIT = 10;

export const userService = {
  getUserProfile: async (username: string, requesterId?: string) => {
    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
      include: {
        _count: {
          select: {
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) throw new AppError("User not found", 404);

    const isFollowed = requesterId
      ? (await prisma.user.findFirst({
          where: {
            id: user.id,
            followers: {
              some: {
                id: requesterId,
              },
            },
          },
        })) !== null
      : false;

    return {
      ...user,
      followersCount: user._count.followers,
      followingCount: user._count.following,
      isFollowed,
      _count: undefined,
    };
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
        likes: {
          include: {
            user: true,
          },
        },
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
        likes: {
          include: {
            user: true,
          },
        },
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
          { width: 400, height: 400, crop: "fill", gravity: "center" },
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
        _count: {
          select: {
            followers: true,
            following: true,
          },
        },
      },
    });

    return {
      ...updatedUser,
      followersCount: updatedUser._count.followers,
      followingCount: updatedUser._count.following,
      isFollowed: false,
      _count: undefined,
    };
  },

  followProfile: async (requesterId: string, userId: string) => {
    if (requesterId === userId)
      throw new AppError("Cannot follow yourself", 400);

    const existingFollow = await prisma.user.findFirst({
      where: {
        id: requesterId,
        following: {
          some: {
            id: userId,
          },
        },
      },
    });

    if (existingFollow) {
      await prisma.user.update({
        where: {
          id: requesterId,
        },
        data: {
          following: {
            disconnect: {
              id: userId,
            },
          },
        },
      });

      return { isFollowed: false };
    } else {
      await prisma.user.update({
        where: {
          id: requesterId,
        },
        data: {
          following: {
            connect: {
              id: userId,
            },
          },
        },
      });

      return { isFollowed: true };
    }
  },

  getFollowingUsers: async (
    requesterId: string,
    userId: string,
    cursor?: string,
    limit: number = DEFAULT_PAGE_LIMIT,
  ) => {
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        following: {
          take: limit + 1,
          ...(cursor && { cursor: { id: cursor }, skip: 1 }),
          orderBy: { username: "asc" },
        },
      },
    });

    if (!targetUser) throw new AppError("User not found", 404);

    const following = targetUser.following;
    const hasMore = following.length > limit;
    const result = hasMore ? following.slice(0, -1) : following;

    const followingIds = result.map((u) => u.id);

    const requesterFollowing = await prisma.user.findUnique({
      where: { id: requesterId },
      select: {
        following: {
          where: { id: { in: followingIds } },
          select: { id: true },
        },
      },
    });

    const requesterFollowingSet = new Set(
      requesterFollowing?.following.map((u) => u.id) || [],
    );

    const formattedUsers = result.map((user) => ({
      ...user,
      isFollowed: requesterFollowingSet.has(user.id),
    }));

    return {
      users: formattedUsers,
      nextCursor: hasMore ? result[result.length - 1]?.id : null,
    };
  },

  getFollowers: async (
    requesterId: string,
    userId: string,
    cursor?: string,
    limit: number = DEFAULT_PAGE_LIMIT,
  ) => {
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        followers: {
          take: limit + 1,
          ...(cursor && { cursor: { id: cursor }, skip: 1 }),
          orderBy: { username: "asc" },
          include: {
            _count: {
              select: {
                followers: true,
                following: true,
              },
            },
          },
        },
      },
    });

    if (!targetUser) throw new AppError("User not found", 404);

    const followers = targetUser.followers;
    const hasMore = followers.length > limit;
    const result = hasMore ? followers.slice(0, -1) : followers;

    const followerIds = result.map((u) => u.id);

    const requesterFollowing = await prisma.user.findUnique({
      where: { id: requesterId },
      select: {
        following: {
          where: { id: { in: followerIds } },
          select: { id: true },
        },
      },
    });

    const requesterFollowingSet = new Set(
      requesterFollowing?.following.map((u) => u.id) || [],
    );

    const formattedUsers = result.map((user) => ({
      ...user,
      followersCount: user._count.followers,
      followingCount: user._count.following,
      isFollowed: requesterFollowingSet.has(user.id),
      _count: undefined,
    }));

    return {
      users: formattedUsers,
      nextCursor: hasMore ? result[result.length - 1]?.id : null,
    };
  },
};
