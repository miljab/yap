import type { Post } from "@/types/post";
import UserAvatar from "../user_components/UserAvatar";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

type PostHistoryProps = {
  post: Post;
};
function PostEditHistory({ post }: PostHistoryProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="w-fit cursor-pointer text-sm text-neutral-500 underline">
          Edited
        </button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Post edition history</DialogTitle>
        </DialogHeader>
        <div className="flex max-h-[500px] flex-col gap-1 overflow-auto">
          {post.history.map((h, idx) => {
            return (
              <div
                key={h.id}
                className={`flex w-full cursor-pointer gap-2 p-2 ${idx !== post.history.length - 1 && "border-b-1"}`}
              >
                <div className="flex flex-col items-center">
                  <UserAvatar
                    avatarUrl={post.user.avatar}
                    username={post.user.username}
                  />
                </div>

                <div className="flex grow flex-col justify-start gap-1">
                  <div className="flex gap-1 text-sm">
                    <span className="flex items-center font-bold">
                      {post.user.username}
                    </span>
                    <span className="text-neutral-500">&middot;</span>
                    <span className="text-neutral-500">
                      {new Date(h.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <p className="wrap-break-word contain-inline-size">
                    {h.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PostEditHistory;
