import { notificationPresenter } from "../presenters/notificationPresenter.js";
import { prisma } from "../prisma/prismaClient.js";
import AppError from "../utils/appError.js";
import { paginate } from "../utils/pagination.js";
import { sseManager } from "./sseManager.js";
import { Prisma } from "@prisma/client";

type NotificationType =
  | "LIKE_POST"
  | "LIKE_COMMENT"
  | "COMMENT_ON_POST"
  | "REPLY_TO_COMMENT"
  | "FOLLOW";

const notificationInclude = {
  notificationActor: {
    include: {
      actor: {
        include: { avatar: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  },
  post: {
    select: { id: true, content: true },
  },
  comment: {
    select: { id: true, content: true },
  },
  _count: {
    select: {
      notificationActor: true,
    },
  },
} satisfies Prisma.NotificationInclude;

function getAggregationWhereClause(
  recipientId: string,
  actorId: string,
  type: NotificationType,
  postId?: string,
  commentId?: string,
) {
  switch (type) {
    case "LIKE_POST":
      if (!postId) return null;
      return { userId: recipientId, type, postId, isRead: false };
    case "LIKE_COMMENT":
      if (!commentId) return null;
      return { userId: recipientId, type, commentId, isRead: false };
    case "FOLLOW":
      return { userId: recipientId, type, actorId, isRead: false };
    default:
      return null;
  }
}

export const notificationService = {
  createNotification: async (
    recipientId: string,
    actorId: string,
    type: NotificationType,
    postId?: string,
    commentId?: string,
  ) => {
    if (recipientId === actorId) return;

    const whereClause = getAggregationWhereClause(
      recipientId,
      actorId,
      type,
      postId,
      commentId,
    );

    if (whereClause) {
      const existingNotification = await prisma.notification.findFirst({
        where: whereClause,
        include: notificationInclude,
      });

      if (existingNotification) {
        const existingActor = await prisma.notificationActor.findUnique({
          where: {
            notificationId_actorId: {
              notificationId: existingNotification.id,
              actorId: actorId,
            },
          },
        });

        if (existingActor) return;

        await prisma.notificationActor.create({
          data: {
            notificationId: existingNotification.id,
            actorId: actorId,
          },
          include: {
            actor: {
              include: {
                avatar: true,
              },
            },
          },
        });

        const updated = await prisma.notification.findUnique({
          where: {
            id: existingNotification.id,
          },
          include: notificationInclude,
        });

        if (updated)
          sseManager.broadcastToUser(
            recipientId,
            notificationPresenter.single(updated),
          );

        return updated;
      }
    }

    const notification = await prisma.notification.create({
      data: {
        userId: recipientId,
        type: type,
        postId: postId ?? null,
        commentId: commentId ?? null,
        notificationActor: {
          create: {
            actorId: actorId,
          },
        },
      },
      include: notificationInclude,
    });

    sseManager.broadcastToUser(
      recipientId,
      notificationPresenter.single(notification),
    );
    return notification;
  },

  getNotifications: async (
    requesterId: string,
    cursor?: string,
    limit: number = 20,
  ) => {
    const notifications = await prisma.notification.findMany({
      where: {
        userId: requesterId,
      },
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      orderBy: {
        updatedAt: "desc",
      },
      include: notificationInclude,
    });

    const { result, nextCursor } = paginate(notifications, limit);

    return notificationPresenter.list(result, { nextCursor });
  },

  removeActorFromNotification: async (
    recipientId: string,
    actorId: string,
    type: NotificationType,
    postId?: string,
    commentId?: string,
  ) => {
    const whereClause = getAggregationWhereClause(
      recipientId,
      actorId,
      type,
      postId,
      commentId,
    );

    if (whereClause) {
      const notification = await prisma.notification.findFirst({
        where: whereClause,
        select: { id: true },
      });

      if (notification) {
        await prisma.notificationActor.delete({
          where: {
            notificationId_actorId: {
              notificationId: notification.id,
              actorId,
            },
          },
        });

        const remainingActors = await prisma.notificationActor.count({
          where: {
            notificationId: notification.id,
          },
        });

        if (remainingActors === 0) {
          await prisma.notification.delete({
            where: {
              id: notification.id,
            },
          });
        }
      }
    }
  },

  markAsRead: async (userId: string, notificationId: string) => {
    const notification = await prisma.notification.findUnique({
      where: {
        id: notificationId,
        userId: userId,
      },
    });

    if (!notification) throw new AppError("Notification not found", 404);

    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  },

  markAllAsRead: async (userId: string) => {
    await prisma.notification.updateMany({
      where: { userId: userId },
      data: {
        isRead: true,
      },
    });
  },

  getUnreadCount: async (userId: string) => {
    const unreadCount = await prisma.notification.count({
      where: {
        userId: userId,
        isRead: false,
      },
    });

    return unreadCount;
  },
};
