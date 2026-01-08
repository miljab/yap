import type { Comment } from "@/types/post";
import { Avatar, AvatarImage } from "./ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import defaultAvatar from "@/assets/default-avatar.png";

type CommentViewProps = {
  comment: Comment;
};

function CommentView({ comment }: CommentViewProps) {
  return (
    <div className="border p-2">
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
        {comment.images.map((image) => {
          return <img key={image.id} src={image.url} />;
        })}
      </div>
    </div>
  );
}

export default CommentView;
