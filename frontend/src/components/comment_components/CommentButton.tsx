import { MessageCircleMore } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import CreateComment from "./CreateComment";
import type { SetStateAction } from "react";
import type { Comment, Post } from "@/types/post";
import UserAvatar from "../user_components/UserAvatar";
import formatTimeAgoOrDate from "@/utils/formatTimeAgoOrDate";
import ImagePreview from "../ImagePreview";

type CommentButtonProps = {
  commentCount: number;
  postId: string;
  target: Post | Comment;
  setComments?: React.Dispatch<SetStateAction<Comment[]>>;
};

function CommentButton({
  commentCount,
  postId,
  target,
  setComments,
}: CommentButtonProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex items-center gap-1" aria-label="Comment">
          <MessageCircleMore className="cursor-pointer transition-all duration-300 hover:text-blue-500" />
          {commentCount > 0 && commentCount}
        </button>
      </DialogTrigger>
      <DialogContent data-no-navigate>
        <div>
          <div className="flex cursor-pointer gap-2 border-b-1 p-2">
            <div className="flex flex-col items-center">
              <UserAvatar
                avatarUrl={target.user.avatar}
                username={target.user.username}
              />
            </div>

            <div className="flex flex-col justify-start gap-1">
              <div className="flex gap-1 text-sm">
                <span className="flex items-center font-bold">
                  {target.user.username}
                </span>
                <span className="text-neutral-500">&middot;</span>
                <span className="text-neutral-500">
                  {formatTimeAgoOrDate(target.createdAt)}
                </span>
              </div>

              <p>{target.content}</p>

              <div>
                <ImagePreview data-no-navigate images={target.images} />
              </div>
            </div>
          </div>
          <CreateComment
            postId={postId}
            parentId={"postId" in target ? target.id : undefined}
            setComments={setComments}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CommentButton;
