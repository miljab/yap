import { Heart, MessageCircleMore } from "lucide-react";

type InteractionButtonsProps = {
  isLiked: boolean;
  likeCount: number;
  commentCount: number;
  isLiking: boolean;
  onLike: () => void;
  onComment?: () => void;
};

function InteractionButtons({
  isLiked,
  likeCount,
  commentCount,
  isLiking,
  onLike,
  onComment,
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
          className={`cursor-pointer transition-all duration-300 hover:text-red-500 ${
            isLiked && "fill-red-500 text-red-500"
          }`}
        />
        {likeCount > 0 && likeCount}
      </button>
      <button
        onClick={onComment}
        className="flex items-center gap-1"
        aria-label="Comment"
      >
        <MessageCircleMore className="cursor-pointer transition-all duration-300 hover:text-blue-500" />
        {commentCount > 0 && commentCount}
      </button>
    </div>
  );
}

export default InteractionButtons;
