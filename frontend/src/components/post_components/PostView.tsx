import type { Post, Comment } from "@/types/post";
import ImagePreview from "../ImagePreview";
import InteractionButtons from "../InteractionButtons";
import { useLike } from "@/hooks/useLike";
import { useNavigate } from "react-router";
import preventNavigation from "@/utils/preventNavigation";
import OptionsButton from "../OptionsButton";
import UserAvatar from "../user_components/UserAvatar";
import useAuthenticatedUser from "@/hooks/useAuthenticatedUser";

type PostViewProps = {
  post: Post;
  onCommentCreated: (newComment: Comment) => void;
};

function PostView({ post, onCommentCreated }: PostViewProps) {
  const { isLiked, likeCount, isLiking, handleLike } = useLike({
    itemId: post.id,
    itemType: "post",
    initialIsLiked: post.isLiked,
    initialLikeCount: post.likeCount,
  });
  const navigate = useNavigate();
  const user = useAuthenticatedUser();

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    preventNavigation(e, navigate, "post", post.id);
  };

  return (
    <div
      className="flex cursor-pointer flex-col gap-2 border-b-1 p-4"
      onClick={(e) => handleContainerClick(e)}
    >
      <div className="flex items-center gap-1 text-sm">
        <UserAvatar
          avatarUrl={post.user.avatar}
          username={post.user.username}
        />

        <div className="flex flex-col">
          <span className="font-bold">{post.user.username}</span>
          <span className="text-neutral-500">
            {new Date(post.createdAt).toLocaleString()}
          </span>
        </div>

        {user.id === post.user.id && (
          <div className="flex grow justify-end">
            <OptionsButton itemType="post" itemId={post.id} />
          </div>
        )}
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
        postId={post.id}
        target={post}
        onCommentCreated={onCommentCreated}
      />
    </div>
  );
}

export default PostView;
