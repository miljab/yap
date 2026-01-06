import { type Post } from "../types/post";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import defaultAvatar from "@/assets/default-avatar.png";
import { Heart, MessageCircleMore } from "lucide-react";

type PostViewProps = {
  post: Post;
};

function PostView({ post }: PostViewProps) {
  console.log(post);

  return (
    <div className="m-4 flex max-w-[500px] flex-col gap-2 border p-4">
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
        <div>
          {post.images.map((image) => (
            <img key={image.id} src={image.url} alt="" />
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button>
          <Heart
            className={`cursor-pointer transition-all duration-300 hover:text-red-500`}
          />
        </button>
        <button>
          <MessageCircleMore />
        </button>
      </div>
    </div>
  );
}

export default PostView;
