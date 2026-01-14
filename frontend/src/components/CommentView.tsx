import type { Comment } from "@/types/post";
import { Avatar, AvatarImage } from "./ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import defaultAvatar from "@/assets/default-avatar.png";
import ImagePreview from "./ImagePreview";
import InteractionButtons from "./InteractionButtons";
import { useLike } from "@/hooks/useLike";
import { useNavigate } from "react-router";

type CommentViewProps = {
  comment: Comment;
};

function CommentView({ comment }: CommentViewProps) {
  const { isLiked, likeCount, isLiking, handleLike } = useLike({
    itemId: comment.id,
    itemType: "comment",
    initialIsLiked: comment.isLiked,
    initialLikeCount: comment.likeCount,
  });
  const navigate = useNavigate();

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const selection = window.getSelection();

    if (
      selection &&
      selection.type === "Range" &&
      selection.toString().length > 0
    ) {
      return;
    }

    const target = e.target as HTMLElement;

    if (
      target.closest("button") ||
      target.closest("a") ||
      target.closest("[data-no-navigate]")
    ) {
      return;
    }

    navigate(`/comment/${comment.id}`);
  };

  return (
    <div
      className="flex flex-col gap-2 border p-2"
      onClick={(e) => handleContainerClick(e)}
    >
      <div className="flex items-center gap-1 text-sm">
        <Avatar>
          <AvatarImage src={comment.user.avatar} />
          <AvatarFallback>
            <img src={defaultAvatar} alt="avatar" />
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col">
          <span className="font-bold">{comment.user.username}</span>
          <span className="text-neutral-500">
            {new Date(comment.createdAt).toLocaleString()}
          </span>
        </div>
      </div>

      <div>
        <p>{comment.content}</p>
        <ImagePreview data-no-navigate images={comment.images} />
      </div>

      <InteractionButtons
        isLiked={isLiked}
        likeCount={likeCount}
        commentCount={comment.commentCount}
        isLiking={isLiking}
        onLike={handleLike}
      />
    </div>
  );
}

export default CommentView;
