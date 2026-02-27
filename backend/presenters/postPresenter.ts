import { Prisma } from "@prisma/client";
import { userPresenter } from "./userPresenter.js";

type BasePostPayload = Prisma.PostGetPayload<{
  include: {
    user: {
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
    };
    images: {
      select: {
        url: true;
        orderIndex: true;
      };
    };

    _count: {
      select: {
        likes: true;
        comments: true;
      };
    };

    likes: {
      select: {
        userId: true;
      };
    };
  };
}>;

type NewPostPayload = Prisma.PostGetPayload<{
  include: {
    user: {
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
    };
    images: {
      select: {
        url: true;
        orderIndex: true;
      };
    };
  };
}>;

export const postPresenter = {
  single(post: BasePostPayload) {
    return {
      id: post.id,
      content: post.content,
      images: post.images,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      commentCount: post._count.comments,
      likeCount: post._count.likes,
      isLiked: post.likes.length > 0,
      user: userPresenter.preview(post.user),
    };
  },

  feed(posts: BasePostPayload[], ctx: { nextCursor: string | null }) {
    return {
      posts: posts.map((post) => this.single(post)),
      nextCursor: ctx.nextCursor,
    };
  },

  new(post: NewPostPayload) {
    return {
      id: post.id,
      content: post.content,
      images: post.images,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      commentCount: 0,
      likeCount: 0,
      isLiked: false,
      user: userPresenter.preview(post.user),
    };
  },
};
