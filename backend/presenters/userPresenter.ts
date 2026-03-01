import "dotenv/config";
import { Prisma } from "@prisma/client";

type UserPreviewPayload = Prisma.UserGetPayload<{
  include: {
    avatar: {
      select: {
        url: true;
      };
    };
  };
  omit: {
    password: true;
  };
}>;

type UserFollowListPayload = Prisma.UserGetPayload<{
  select: {
    id: true;
    username: true;
    bio: true;
  };
  include: {
    avatar: {
      select: {
        url: true;
      };
    };
  };
  omit: {
    password: true;
  };
}>;

type UserProfilePayload = Prisma.UserGetPayload<{
  include: {
    avatar: {
      select: {
        url: true;
      };
    };
    _count: {
      select: {
        followers: true;
        following: true;
      };
    };
  };

  omit: {
    password: true;
  };
}>;

type UserLikePayload = Prisma.UserGetPayload<{
  include: {
    avatar: {
      select: {
        url: true;
      };
    };
  };

  omit: {
    password: true;
  };
}>;

type UserAuthPayload = Prisma.UserGetPayload<{
  include: {
    avatar: {
      select: {
        url: true;
      };
    };
  };
  omit: {
    password: true;
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
      followersCount: user._count.followers,
      followingCount: user._count.following,
      isFollowed: ctx.isFollowed,
      createdAt: user.createdAt,
    };
  },

  followList(
    users: UserFollowListPayload[],
    ctx: { followingSet: Set<string>; nextCursor: string | null },
  ) {
    return {
      users: users.map((user) => {
        return {
          id: user.id,
          username: user.username,
          avatarUrl: user.avatar?.url || DEFAULT_AVATAR,
          bio: user.bio,
          isFollowed: ctx.followingSet.has(user.id),
        };
      }),
      nextCursor: ctx.nextCursor,
    };
  },

  likeList(users: UserLikePayload[], ctx: { nextCursor: string | null }) {
    return {
      users: users.map((u) => {
        return {
          id: u.id,
          username: u.username,
          avatarUrl: u.avatar?.url || DEFAULT_AVATAR,
        };
      }),
      nextCursor: ctx.nextCursor,
    };
  },

  auth(user: UserAuthPayload) {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatar?.url || DEFAULT_AVATAR,
    };
  },
};
