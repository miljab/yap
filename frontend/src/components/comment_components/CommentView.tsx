import type { Comment } from "@/types/post";
import ImagePreview from "../ImagePreview";
import InteractionButtons from "../InteractionButtons";
import { useLike } from "@/hooks/useLike";
import { useNavigate } from "react-router";
import formatTimeAgoOrDate from "@/utils/formatTimeAgoOrDate";
import preventNavigation from "@/utils/preventNavigation";
import UserAvatar from "../user_components/UserAvatar";

type CommentViewProps = {
  comment: Comment;
  isSelected?: boolean;
  isParent?: boolean;
  onCommentCreated: (newComment: Comment) => void;
};

function CommentView({
  comment,
  isSelected = false,
  isParent = false,
  onCommentCreated,
}: CommentViewProps) {
  const { isLiked, likeCount, isLiking, handleLike, likedBy } = useLike({
    itemId: comment.id,
    itemType: "comment",
    initialIsLiked: comment.isLiked,
    initialLikeCount: comment.likeCount,
    initialLikedBy: comment.likes,
  });
  const navigate = useNavigate();

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    preventNavigation(e, navigate, "comment", comment.id);
  };

  if (isSelected) {
    return (
      <div
        className="flex cursor-pointer flex-col gap-2 p-2"
        onClick={(e) => handleContainerClick(e)}
      >
        <div className="flex items-center gap-1 text-sm">
          <UserAvatar
            avatarUrl={comment.user.avatar}
            username={comment.user.username}
          />

          <div className="flex flex-col">
            <span className="font-bold">{comment.user.username}</span>
            <span className="text-neutral-500">
              {new Date(comment.createdAt).toLocaleString()}
            </span>
          </div>
        </div>

        <div>
          <p className="text-lg wrap-break-word">{comment.content}</p>
          <ImagePreview data-no-navigate images={comment.images} />
        </div>

        <InteractionButtons
          isLiked={isLiked}
          likeCount={likeCount}
          commentCount={comment.commentCount}
          isLiking={isLiking}
          onLike={handleLike}
          likedBy={likedBy}
          postId={comment.postId}
          target={comment}
          onCommentCreated={onCommentCreated}
        />
      </div>
    );
  }

  return (
    <div
      className="flex cursor-pointer gap-2 border-b-1 p-2"
      onClick={(e) => handleContainerClick(e)}
    >
      <div className="flex flex-col items-center">
        <UserAvatar
          avatarUrl={comment.user.avatar}
          username={comment.user.username}
        />

        {isParent && <div className="mt-3 h-full w-[2px] bg-gray-500"></div>}
      </div>

      <div className="flex w-full flex-col justify-start gap-1">
        <div className="flex gap-1 text-sm">
          <span className="flex items-center font-bold">
            {comment.user.username}
          </span>
          <span className="text-neutral-500">&middot;</span>
          <span className="text-neutral-500">
            {formatTimeAgoOrDate(comment.createdAt)}
          </span>
        </div>

        <p className="wrap-break-word contain-inline-size">{comment.content}</p>

        <div>
          <ImagePreview data-no-navigate images={comment.images} />
        </div>

        <div>
          <InteractionButtons
            isLiked={isLiked}
            likeCount={likeCount}
            commentCount={comment.commentCount}
            isLiking={isLiking}
            onLike={handleLike}
            likedBy={likedBy}
            postId={comment.postId}
            target={comment}
            onCommentCreated={onCommentCreated}
          />
        </div>
      </div>
    </div>
  );
}

export default CommentView;
