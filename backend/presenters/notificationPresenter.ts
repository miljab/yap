import { Prisma } from "@prisma/client";

type NotificationPayload = Prisma.NotificationGetPayload<{
  include: {
    actor: {
      select: {
        id: true;
        username: true;
        avatar: {
          select: {
            url: true;
          };
        };
      };
    };
    post: {
      select: {
        id: true;
      };
    };
    comment: {
      select: {
        id: true;
      };
    };
  };
}>;

const DEFAULT_AVATAR = process.env.DEFAULT_AVATAR_URL!;

export const notificationPresenter = {
  single(notification: NotificationPayload) {
    return {
      id: notification.id,
      type: notification.type,
      isRead: notification.isRead,
      actorCount: notification.actorCount,
      actor: notification.actor
        ? {
            id: notification.actor.id,
            username: notification.actor.username,
            avatarUrl: notification.actor.avatar?.url || DEFAULT_AVATAR,
          }
        : null,
      postId: notification.postId,
      commentId: notification.commentId,
      createdAt: notification.createdAt,
    };
  },

  list(
    notifications: NotificationPayload[],
    ctx: { nextCursor: string | null },
  ) {
    return {
      notifications: notifications.map((n) => this.single(n)),
      nextCursor: ctx.nextCursor,
    };
  },
};
