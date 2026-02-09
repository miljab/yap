import { Heart } from "lucide-react";
import CommentButton from "./comment_components/CommentButton";
import type { Post, Comment, Like } from "@/types/post";
import useAuthenticatedUser from "@/hooks/useAuthenticatedUser";
import LikedBy from "./LikedBy";

type InteractionButtonsProps = {
  isLiked: boolean;
  likeCount: number;
  commentCount: number;
  isLiking: boolean;
  onLike: () => void;
  likedBy: Like[];

  postId: string;
  target: Post | Comment;
  onCommentCreated: (newComment: Comment) => void;
};

function InteractionButtons({
  isLiked,
  likeCount,
  commentCount,
  isLiking,
  onLike,
  likedBy,
  postId,
  target,
  onCommentCreated,
}: InteractionButtonsProps) {
  const user = useAuthenticatedUser();

  return (
    <div className="flex gap-4">
      <div className="flex items-center gap-1">
        <button
          disabled={isLiking}
          onClick={onLike}
          className="disabled:opacity-50"
          aria-label={isLiked ? "Unlike" : "Like"}
          data-no-navigate
        >
          <Heart
            className={`cursor-pointer hover:text-red-500 hover:transition-all hover:duration-300 ${
              isLiked && "fill-red-500 text-red-500"
            }`}
          />
        </button>
        {likeCount > 0 &&
          (user.id !== target.user.id ? (
            likeCount
          ) : (
            <LikedBy likes={likedBy} likeCount={likeCount} />
          ))}
      </div>

      <CommentButton
        commentCount={commentCount}
        postId={postId}
        target={target}
        onCommentCreated={onCommentCreated}
      />
    </div>
  );
}

export default InteractionButtons;
