import type { Comment } from "@/types/post";
import { Avatar, AvatarImage } from "./ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import defaultAvatar from "@/assets/default-avatar.png";
import ImagePreview from "./ImagePreview";
import { Heart, MessageCircleMore } from "lucide-react";
import { useState } from "react";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { toast } from "sonner";

type CommentViewProps = {
  comment: Comment;
};

function CommentView({ comment }: CommentViewProps) {
  const [isLiking, setLiking] = useState(false);
  const [isLiked, setLiked] = useState(comment.isLiked);
  const [likeCount, setLikeCount] = useState(comment.likeCount);
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
      const { data } = await axiosPrivate.post(`/comment/${comment.id}/like`);
      setLikeCount(data.likeCount);
    } catch (error) {
      console.error(error);

      toast.error(
        prevLiked
          ? "Failed to dislike comment. Please try again."
          : "Failed to like comment. Please try again",
      );

      setLiked(prevLiked);
      setLikeCount(prevLikeCount);
    } finally {
      setLiking(false);
    }
  }
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

      <div className="flex justify-start gap-4">
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
          {comment.commentCount > 0 && comment.commentCount}
        </button>
      </div>
    </div>
  );
}

export default CommentView;
