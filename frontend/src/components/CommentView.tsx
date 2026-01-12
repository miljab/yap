import type { Comment } from "@/types/post";
import { Avatar, AvatarImage } from "./ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import defaultAvatar from "@/assets/default-avatar.png";
import ImagePreview from "./ImagePreview";
import InteractionButtons from "./InteractionButtons";
import { useLike } from "@/hooks/useLike";

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

  return (
    <div className="flex flex-col gap-2 border p-2">
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
        <ImagePreview images={comment.images} />
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
