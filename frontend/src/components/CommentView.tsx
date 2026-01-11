import type { Comment } from "@/types/post";
import { Avatar, AvatarImage } from "./ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import defaultAvatar from "@/assets/default-avatar.png";
import ImagePreview from "./ImagePreview";
import { Heart, MessageCircleMore } from "lucide-react";

type CommentViewProps = {
  comment: Comment;
};

function CommentView({ comment }: CommentViewProps) {
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
        <button className="flex items-center gap-1">
          <Heart
            className={`cursor-pointer transition-all duration-300 hover:text-red-500 ${comment.isLiked && "fill-red-500 text-red-500"}`}
          />
          {comment.likeCount > 0 && comment.likeCount}
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
