import "dotenv/config";
import { Prisma } from "@prisma/client";

type UserPreviewPayload = Prisma.UserGetPayload<{
  include: {
    avatar: true;
  };
}>;

type UserProfilePayload = Prisma.UserGetPayload<{
  include: {
    avatar: true;
    _count: {
      select: {
        followers: true;
        following: true;
      };
    };
  };
}>;

const DEFAULT_AVATAR = process.env.DEFAULT_AVATAR_URL!;

export const userPresenter = {
  preview(user: UserPreviewPayload) {
    return {
      id: user.id,
      username: user.username,
      avatarUrl: user.avatar?.url || DEFAULT_AVATAR,
    };
  },

  profile(user: UserProfilePayload, ctx: { isFollowed: boolean }) {
    return {
      id: user.id,
      username: user.username,
      avatarUrl: user.avatar?.url || DEFAULT_AVATAR,
      bio: user.bio,
      followerCount: user._count.followers,
      followingCount: user._count.following,
      isFollowed: ctx.isFollowed,
      createdAt: user.createdAt,
    };
  },
};
