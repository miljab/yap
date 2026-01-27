import { MessageCircleMore } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import CreateComment from "./CreateComment";
import type { SetStateAction } from "react";
import type { Comment } from "@/types/post";

type CommentButtonProps = {
  commentCount: number;
  postId: string;
  parentId?: string;
  setComments?: React.Dispatch<SetStateAction<Comment[]>>;
};

function CommentButton({
  commentCount,
  postId,
  parentId,
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
        <CreateComment
          postId={postId}
          parentId={parentId}
          setComments={setComments}
        />
      </DialogContent>
    </Dialog>
  );
}

export default CommentButton;
