import { Prisma } from "@prisma/client";

type NotificationPayload = Prisma.NotificationGetPayload<{
  include: {
    notificationActor: {
      include: {
        actor: {
          include: {
            avatar: true;
          };
        };
      };
    };

    post: {
      select: {
        id: true;
        content: true;
      };
    };

    comment: {
      select: {
        id: true;
        content: true;
      };
    };

    _count: {
      select: {
        notificationActor: true;
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
      actorCount: notification._count.notificationActor,
      actors: notification.notificationActor
        ? notification.notificationActor.map((na) => {
            return {
              id: na.actor.id,
              username: na.actor.username,
              avatarUrl: na.actor.avatar?.url || DEFAULT_AVATAR,
            };
          })
        : null,
      postId: notification.postId ?? null,
      commentId: notification.commentId ?? null,
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
