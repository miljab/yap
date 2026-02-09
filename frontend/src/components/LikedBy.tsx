import type { Like } from "@/types/post";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import UserAvatar from "./user_components/UserAvatar";

type LikedByProps = {
  likes: Like[];
  likeCount: number;
};

function LikedBy({ likes, likeCount }: LikedByProps) {
  console.log(likes);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="cursor-pointer hover:underline">{likeCount}</button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Liked by</DialogTitle>
        </DialogHeader>

        <div className="flex max-h-[500px] flex-col gap-2 overflow-auto">
          {likes.map((like, idx) => {
            return (
              <div
                className={`flex items-center gap-2 p-1 ${idx !== likes.length - 1 && "border-b-1"}`}
              >
                <UserAvatar
                  avatarUrl={like.user.avatar}
                  username={like.user.username}
                />
                <span>{like.user.username}</span>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default LikedBy;
