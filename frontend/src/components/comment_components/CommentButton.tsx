import { MessageCircleMore } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import CreateComment from "./CreateComment";
import type { Comment, Post } from "@/types/post";
import UserAvatar from "../user_components/UserAvatar";
import formatTimeAgoOrDate from "@/utils/formatTimeAgoOrDate";
import ImagePreview from "../ImagePreview";
import { useState } from "react";
import { Link } from "react-router";

type CommentButtonProps = {
  commentCount: number;
  postId: string;
  target: Post | Comment;
  onCommentCreated: (newComment: Comment) => void;
};

function CommentButton({
  commentCount,
  postId,
  target,
  onCommentCreated,
}: CommentButtonProps) {
  const [open, setOpen] = useState(false);

  const closeDialog = () => {
    setOpen(false);
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-1" aria-label="Comment">
          <MessageCircleMore className="cursor-pointer transition-all duration-300 hover:text-blue-500" />
          {commentCount > 0 && commentCount}
        </button>
      </DialogTrigger>
      <DialogContent data-no-navigate>
        <div className="flex cursor-pointer gap-2 p-2">
          <div className="flex flex-col items-center">
            <UserAvatar
              avatarUrl={target.user.avatarUrl}
              username={target.user.username}
            />
          </div>

          <div className="flex w-full flex-col justify-start gap-1">
            <div className="flex gap-1 text-sm">
              <Link
                to={`/profile/${target.user.username}`}
                className="flex cursor-pointer items-center font-bold hover:underline"
              >
                {target.user.username}
              </Link>
              <span className="text-neutral-500">&middot;</span>
              <span className="text-neutral-500">
                {formatTimeAgoOrDate(target.createdAt)}
              </span>
            </div>

            <p className="wrap-break-word contain-inline-size">
              {target.content}
            </p>

            <div>
              <ImagePreview data-no-navigate images={target.images} />
            </div>
          </div>
        </div>
        <div className="rounded-md border">
          <CreateComment
            postId={postId}
            parentId={"postId" in target ? target.id : undefined}
            closeDialog={closeDialog}
            autoFocus={true}
            onCommentCreated={onCommentCreated}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CommentButton;
