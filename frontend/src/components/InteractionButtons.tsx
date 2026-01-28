import { Heart } from "lucide-react";
import CommentButton from "./comment_components/CommentButton";
import type { SetStateAction } from "react";
import type { Post, Comment } from "@/types/post";

type InteractionButtonsProps = {
  isLiked: boolean;
  likeCount: number;
  commentCount: number;
  isLiking: boolean;
  onLike: () => void;

  postId: string;
  target: Post | Comment;
  setComments?: React.Dispatch<SetStateAction<Comment[]>>;
};

function InteractionButtons({
  isLiked,
  likeCount,
  commentCount,
  isLiking,
  onLike,
  postId,
  target,
  setComments,
}: InteractionButtonsProps) {
  return (
    <div className="flex justify-start gap-4">
      <button
        disabled={isLiking}
        onClick={onLike}
        className="flex items-center gap-1 disabled:opacity-50"
        aria-label={isLiked ? "Unlike" : "Like"}
        data-no-navigate
      >
        <Heart
          className={`cursor-pointer hover:text-red-500 hover:transition-all hover:duration-300 ${
            isLiked && "fill-red-500 text-red-500"
          }`}
        />
        {likeCount > 0 && likeCount}
      </button>

      <CommentButton
        commentCount={commentCount}
        postId={postId}
        target={target}
        setComments={setComments}
      />
    </div>
  );
}

export default InteractionButtons;
