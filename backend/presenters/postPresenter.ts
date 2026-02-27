import { Prisma } from "@prisma/client";
import { userPresenter } from "./userPresenter.js";

type PostPayload = Prisma.PostGetPayload<{
  include: {
    user: {
      include: {
        avatar: true;
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

export const postPresenter = {
  single(post: PostPayload) {
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

  feed(posts: PostPayload[]) {
    return posts.map((post) => this.single(post));
  },
};
