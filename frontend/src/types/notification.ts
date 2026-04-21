export type Notification = {
  id: string;
  type:
    | "LIKE_POST"
    | "LIKE_COMMENT"
    | "COMMENT_ON_POST"
    | "REPLY_TO_COMMENT"
    | "FOLLOW";
  isRead: boolean;
  actorCount: number;
  actors: { id: string; username: string; avatarUrl: string }[] | null;
  postId?: string;
  commentId?: string;
  createdAt: Date;
};
