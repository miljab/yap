import { type Post } from "../types/post";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import defaultAvatar from "@/assets/default-avatar.png";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { Heart, MessageCircleMore } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import ImagePreview from "./ImagePreview";

type PostViewProps = {
  post: Post;
};

function PostView({ post }: PostViewProps) {
  const [isLiking, setLiking] = useState(false);
  const [isLiked, setLiked] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const axiosPrivate = useAxiosPrivate();

  async function handleLike() {
    if (isLiking) return;

    setLiking(true);
    const prevLiked = isLiked;
    const prevLikeCount = likeCount;

    if (isLiked) {
      setLiked(false);
      setLikeCount((prev) => prev - 1);
    } else {
      setLiked(true);
      setLikeCount((prev) => prev + 1);
    }

    try {
      const { data } = await axiosPrivate.post(`/post/${post.id}/like`);
      setLikeCount(data.likeCount);
    } catch (error) {
      console.error(error);

      toast.error(
        prevLiked
          ? "Failed to dislike post. Please try again."
          : "Failed to like post. Please try again",
      );

      setLiked(prevLiked);
      setLikeCount(prevLikeCount);
    } finally {
      setLiking(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 border p-4">
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
        <p>{post.content}</p>
        <ImagePreview images={post.images} />
      </div>

      <div className="flex justify-end gap-4">
        <button
          disabled={isLiking}
          onClick={handleLike}
          className="flex items-center gap-1"
        >
          <Heart
            className={`cursor-pointer transition-all duration-300 hover:text-red-500 ${isLiked && "fill-red-500 text-red-500"}`}
          />
          {likeCount > 0 && likeCount}
        </button>
        <button className="flex items-center gap-1">
          <MessageCircleMore />
          {post.commentCount > 0 && post.commentCount}
        </button>
      </div>
    </div>
  );
}

export default PostView;
