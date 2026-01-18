import { type Post } from "../types/post";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import defaultAvatar from "@/assets/default-avatar.png";
import ImagePreview from "./ImagePreview";
import InteractionButtons from "./InteractionButtons";
import { useLike } from "@/hooks/useLike";
import { useNavigate } from "react-router";
import preventNavigation from "@/utils/preventNavigation";

type PostViewProps = {
  post: Post;
};

function PostView({ post }: PostViewProps) {
  const { isLiked, likeCount, isLiking, handleLike } = useLike({
    itemId: post.id,
    itemType: "post",
    initialIsLiked: post.isLiked,
    initialLikeCount: post.likeCount,
  });
  const navigate = useNavigate();

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    preventNavigation(e, navigate, "post", post.id);
  };

  return (
    <div
      className="flex cursor-pointer flex-col gap-2 border p-4"
      onClick={(e) => handleContainerClick(e)}
    >
      <div className="flex items-center gap-1 text-sm">
        <Avatar>
          <AvatarImage src={post.user.avatar} />
          <AvatarFallback>
            <img src={defaultAvatar} alt="avatar" />
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col">
          <span className="font-bold">{post.user.username}</span>
          <span className="text-neutral-500">
            {new Date(post.createdAt).toLocaleString()}
          </span>
        </div>
      </div>

      <div>
        <p className="text-lg">{post.content}</p>
        <ImagePreview data-no-navigate images={post.images} />
      </div>

      <InteractionButtons
        isLiked={isLiked}
        likeCount={likeCount}
        commentCount={post.commentCount}
        isLiking={isLiking}
        onLike={handleLike}
      />
    </div>
  );
}

export default PostView;
