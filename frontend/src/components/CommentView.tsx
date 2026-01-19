import type { Comment } from "@/types/post";
import { Avatar, AvatarImage } from "./ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import defaultAvatar from "@/assets/default-avatar.png";
import ImagePreview from "./ImagePreview";
import InteractionButtons from "./InteractionButtons";
import { useLike } from "@/hooks/useLike";
import { useNavigate } from "react-router";
import formatTimeAgoOrDate from "@/utils/formatTimeAgoOrDate";
import preventNavigation from "@/utils/preventNavigation";

type CommentViewProps = {
  comment: Comment;
  isSelected?: boolean;
  isParent?: boolean;
};

function CommentView({
  comment,
  isSelected = false,
  isParent = false,
}: CommentViewProps) {
  const { isLiked, likeCount, isLiking, handleLike } = useLike({
    itemId: comment.id,
    itemType: "comment",
    initialIsLiked: comment.isLiked,
    initialLikeCount: comment.likeCount,
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
          <p className="text-lg">{comment.content}</p>
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

  return (
    <div
      className="flex cursor-pointer gap-2 border-b-1 p-2"
      onClick={(e) => handleContainerClick(e)}
    >
      <div className="flex flex-col items-center">
        <Avatar>
          <AvatarImage src={comment.user.avatar} />
          <AvatarFallback>
            <img src={defaultAvatar} alt="avatar" />
          </AvatarFallback>
        </Avatar>

        {isParent && <div className="mt-3 h-full w-[2px] bg-gray-500"></div>}
      </div>

      <div className="flex flex-col justify-start gap-1">
        <div className="flex gap-1 text-sm">
          <span className="flex items-center font-bold">
            {comment.user.username}
          </span>
          <span className="text-neutral-500">&middot;</span>
          <span className="text-neutral-500">
            {formatTimeAgoOrDate(comment.createdAt)}
          </span>
        </div>

        <p>{comment.content}</p>

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
          />
        </div>
      </div>
    </div>
  );
}

export default CommentView;
