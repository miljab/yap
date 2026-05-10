import type { Notification } from "@/types/notification";
import { Heart, MessageCircleMore, Reply, UserPlus } from "lucide-react";
import { Link } from "react-router";
import UserAvatar from "./user_components/UserAvatar";
import { cn } from "@/lib/utils";

type NotificationProps = {
  notification: Notification;
};

const iconMap = {
  LIKE_POST: Heart,
  LIKE_COMMENT: Heart,
  COMMENT_ON_POST: MessageCircleMore,
  REPLY_TO_COMMENT: Reply,
  FOLLOW: UserPlus,
} as const;

const iconColorMap = {
  LIKE_POST: "text-red-500",
  LIKE_COMMENT: "text-red-500",
  COMMENT_ON_POST: "text-blue-500",
  REPLY_TO_COMMENT: "text-blue-500",
  FOLLOW: "text-green-500",
} as const;

const actionTextMap: Record<Notification["type"], string> = {
  LIKE_POST: "liked your post",
  LIKE_COMMENT: "liked your comment",
  COMMENT_ON_POST: "commented on your post",
  REPLY_TO_COMMENT: "replied to your comment",
  FOLLOW: "followed you",
};

function getActorText(
  actors: Notification["actors"],
  actorCount: number,
): string {
  if (!actors || actors.length === 0) return "Someone";

  if (actorCount === 1) return actors[0].username;
  if (actorCount === 2)
    return `${actors[0].username} and ${actors[1].username}`;

  const remaining = actorCount - 2;
  return `${actors[0].username}, ${actors[1].username} and ${remaining} ${remaining === 1 ? "other" : "others"}`;
}

function getLinkTo(notification: Notification): string {
  const { type, postId, commentId, actors } = notification;

  if (type === "FOLLOW" && actors?.[0]) {
    return `/profile/${actors[0].username}`;
  }
  if (postId) return `/post/${postId}`;
  if (commentId) return `/comment/${commentId}`;
  return "/notifications";
}

function NotificationItem({ notification }: NotificationProps) {
  const { type, actors, actorCount, isRead, createdAt } = notification;
  const Icon = iconMap[type];
  const iconColor = iconColorMap[type];
  const actionText = actionTextMap[type];
  const actorText = getActorText(actors, actorCount);
  const linkTo = getLinkTo(notification);

  const displayActors = actors?.slice(0, 3) ?? [];

  return (
    <Link
      to={linkTo}
      className={cn(
        "flex items-start gap-3 border-b p-4 transition-colors hover:bg-accent/50",
        !isRead && "bg-accent/30",
      )}
    >
      <div className={cn("mt-0.5 shrink-0", iconColor)}>
        <Icon size={20} />
      </div>

      <div className="flex min-w-0 flex-1 items-start gap-2">
        {displayActors.length > 0 && (
          <div className="flex shrink-0 -space-x-2">
            {displayActors.map((actor) => (
              <UserAvatar
                key={actor.id}
                avatarUrl={actor.avatarUrl}
                username={actor.username}
                className="size-7 border-2 border-background"
                redirect={false}
              />
            ))}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="text-sm">
            <span className="font-bold">{actorText}</span>{" "}
            <span className="text-muted-foreground">{actionText}</span>
          </p>
          <p className="text-muted-foreground text-xs">
            {new Date(createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      {!isRead && (
        <div className="mt-2 size-2 shrink-0 rounded-full bg-blue-500" />
      )}
    </Link>
  );
}

export default NotificationItem;
