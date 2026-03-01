import { prisma } from "../prisma/prismaClient.js";
import AppError from "../utils/appError.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs/promises";
import { nanoid } from "nanoid";
import { userPresenter } from "../presenters/userPresenter.js";
import { basePostInclude } from "./postService.js";
import { postPresenter } from "../presenters/postPresenter.js";
import { baseCommentInclude } from "./commentService.js";
import { commentPresenter } from "../presenters/commentPresenter.js";
import { paginate } from "../utils/pagination.js";

const DEFAULT_PAGE_LIMIT = 10;

export const userService = {
  getUserProfile: async (username: string, requesterId: string) => {
    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
      include: {
        avatar: {
          select: {
            url: true,
          },
        },

        _count: {
          select: {
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) throw new AppError("User not found", 404);

    const isFollowed =
      (await prisma.follow.findFirst({
        where: {
          followerId: requesterId,
          following: {
            username: username,
          },
        },
      })) !== null;

    return userPresenter.profile(user, { isFollowed });
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
      include: basePostInclude(requesterId),
    });

    const { result, nextCursor } = paginate(posts, limit);

    return postPresenter.feed(result, { nextCursor });
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
      include: baseCommentInclude(requesterId),
    });

    const { result, nextCursor } = paginate(comments, limit);

    return commentPresenter.feed(result, { nextCursor });
  },

  updateProfile: async (
    userId: string,
    bio?: string,
    avatarFile?: Express.Multer.File,
  ) => {
    let avatarData;

    if (avatarFile) {
      const result = await cloudinary.uploader.upload(avatarFile.path, {
        folder: "avatars",
        public_id: nanoid(),
        transformation: [
          { width: 400, height: 400, crop: "fill", gravity: "center" },
        ],
      });

      avatarData = {
        url: result.secure_url,
        cloudinaryPublicId: result.public_id,
      };

      await fs.unlink(avatarFile.path);
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...(bio !== undefined && { bio }),
        ...(avatarData && {
          avatar: {
            upsert: {
              update: avatarData,
              create: avatarData,
            },
          },
        }),
      },

      include: {
        avatar: { select: { url: true } },

        _count: {
          select: {
            following: true,
            followers: true,
          },
        },
      },
    });

    return userPresenter.profile(updatedUser, { isFollowed: false });
  },

  followProfile: async (requesterId: string, userId: string) => {
    if (requesterId === userId)
      throw new AppError("Cannot follow yourself", 400);

    const existingFollow = await prisma.follow.findUnique({
      where: {
        followingId_followerId: {
          followerId: requesterId,
          followingId: userId,
        },
      },
    });

    if (existingFollow) {
      await prisma.follow.delete({
        where: {
          followingId_followerId: {
            followerId: requesterId,
            followingId: userId,
          },
        },
      });

      return { isFollowed: false };
    } else {
      await prisma.follow.create({
        data: {
          followerId: requesterId,
          followingId: userId,
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
    const userExist = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
      },
    });

    if (!userExist) throw new AppError("User not found", 404);

    const following = await prisma.follow.findMany({
      where: {
        followerId: userId,
      },
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      include: {
        following: {
          include: {
            avatar: {
              select: {
                url: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const { result, nextCursor } = paginate(following, limit);

    const followingIds = result.map((f) => f.followingId);

    const requesterFollowing = await prisma.follow.findMany({
      select: {
        followingId: true,
      },
      where: {
        followerId: requesterId,
        followingId: {
          in: followingIds,
        },
      },
    });

    const requesterFollowingSet = new Set(
      requesterFollowing?.map((f) => f.followingId) || [],
    );

    const users = following.map((f) => f.following);

    return userPresenter.followList(users, {
      followingSet: requesterFollowingSet,
      nextCursor,
    });
  },

  getFollowers: async (
    requesterId: string,
    userId: string,
    cursor?: string,
    limit: number = DEFAULT_PAGE_LIMIT,
  ) => {
    const userExist = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
      },
    });

    if (!userExist) throw new AppError("User not found", 404);

    const followers = await prisma.follow.findMany({
      where: {
        followingId: userId,
      },
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      include: {
        follower: {
          include: {
            avatar: {
              select: {
                url: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const { result, nextCursor } = paginate(followers, limit);

    const followerIds = result.map((f) => f.followerId);

    const requesterFollowing = await prisma.follow.findMany({
      select: {
        followingId: true,
      },
      where: {
        followerId: requesterId,
        followingId: {
          in: followerIds,
        },
      },
    });

    const requesterFollowingSet = new Set(
      requesterFollowing?.map((f) => f.followingId) || [],
    );

    const users = followers.map((f) => f.follower);

    return userPresenter.followList(users, {
      followingSet: requesterFollowingSet,
      nextCursor,
    });
  },
};
