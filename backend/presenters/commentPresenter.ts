import { Prisma } from "@prisma/client";
import { userPresenter } from "./userPresenter.js";

type BaseCommentPayload = Prisma.CommentGetPayload<{
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

    likes: {
      select: {
        userId: true;
      };
    };

    _count: {
      select: {
        likes: true;
        replies: true;
      };
    };
  };
}>;

type NewCommentPayload = Prisma.CommentGetPayload<{
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

export const commentPresenter = {
  single(comment: BaseCommentPayload) {
    return {
      id: comment.id,
      content: comment.content,
      images: comment.images,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      parentId: comment.parentId,
      commentCount: comment._count.replies,
      likeCount: comment._count.likes,
      isLiked: comment.likes.length > 0,
      user: userPresenter.preview(comment.user),
    };
  },

  list(comments: BaseCommentPayload[]) {
    return comments.map((comment) => this.single(comment));
  },

  new(comment: NewCommentPayload) {
    return {
      id: comment.id,
      content: comment.content,
      images: comment.images,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      parentId: comment.parentId,
      commentCount: 0,
      likeCount: 0,
      isLiked: false,
      user: userPresenter.preview(comment.user),
    };
  },
};
